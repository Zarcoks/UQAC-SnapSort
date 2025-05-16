import os
import time

from PIL import Image
from tabulate import tabulate
import numpy as np
import torch
from transformers import CLIPProcessor, CLIPModel
from sklearn.metrics.pairwise import cosine_similarity

from dataframe_completion import DataframeCompletion
from clustering_manager import ClusteringManager

class LLMCall:
    def __init__(self, directory, allowed_extensions=None):
        if allowed_extensions is None:
            allowed_extensions = {".jpg", ".jpeg", ".png", ".gif"}
        self.allowed_extensions = allowed_extensions
        self.directory = directory

        self.image_paths = self.get_image_paths(directory)

        self.dataframe_manager = DataframeCompletion(self.image_paths)
        self.df = DataframeCompletion(self.image_paths).get_dataframe()

    def get_image_paths(self, directory):
        image_paths = [os.path.join(directory, filename) for filename in os.listdir(directory) if os.path.splitext(filename)[1].lower() in self.allowed_extensions]
        return image_paths

    def pipeline_categories_embedding_with_clusters(self, threshold=0.1, batch_size=10, predefined_categories=None):
        """
        Attribue des catégories en utilisant les clusters comme unité de base.
        Toutes les images d'un même cluster reçoivent la même catégorie.
        """
        if predefined_categories is None:
            predefined_categories = ["Ville", "Plage", "Randonnée", "Sport", "Musée", "Nourriture", "Voyages", "Nature", "Neige", "Bâtiment", "Autres", "Famille et amis", "Animaux"]
        
        clustering_manager = ClusteringManager(self.df)
        
        # Choix de la méthode de clustering
        clustered_df, clusters_by_day = clustering_manager.perform_neighbors_clustering(threshold=0.6, n_neighbors=3)
        
        self.df = clustered_df
        print(f"Clustering terminé: {len(clusters_by_day)} jours traités")
        
        clip_model = CLIPModel.from_pretrained("laion/CLIP-ViT-L-14-laion2B-s32B-b82K")
        clip_processor = CLIPProcessor.from_pretrained("laion/CLIP-ViT-L-14-laion2B-s32B-b82K")
        device = "cuda" if torch.cuda.is_available() else "cpu"
        clip_model = clip_model.to(device)
        
        # Ajout de traduction anglaise pour chaque catégorie pour améliorer la correspondance car CLIP fonctionne mieux en anglais qu'en français
        fr_to_en = {
            "Ville": "City urban buildings",
            "Plage": "Beach sea ocean sand",
            "Randonnée": "Hiking trail forest path",
            "Sport": "Sports activity athletic",
            "Musée": "Museum exhibition art gallery",
            "Restaurant": "Restaurant dining food",
            "Voyages": "Travel vacation snow",
            "Nature": "Nature wildlife environment flora fauna",
            "Autres": "Miscellaneous other"
        }
        
        en_categories = [fr_to_en.get(cat, cat) for cat in predefined_categories]
        
        # Encodage des catégories
        text_inputs = clip_processor(text=en_categories, return_tensors="pt", padding=True).to(device)
        with torch.no_grad():
            category_embeddings = clip_model.get_text_features(**text_inputs)
        category_embeddings = category_embeddings / category_embeddings.norm(p=2, dim=-1, keepdim=True)
        category_embeddings = category_embeddings.cpu().numpy()

        print(clusters_by_day)
        
        # Traitement de chaque cluster
        for day, day_clusters in clusters_by_day.items():
            for cluster_name, image_paths in day_clusters.items():
                if not image_paths:
                    continue
                    
                print(f"Traitement du cluster {cluster_name} avec {len(image_paths)} images")
                
                # Encodage par lots des images du cluster
                cluster_images = []
                valid_paths = []
                
                # Chargement des images du cluster
                for path in image_paths:
                    try:
                        image = Image.open(path).convert("RGB")
                        cluster_images.append(image)
                        valid_paths.append(path)
                    except Exception as e:
                        print(f"Erreur lors du chargement de l'image {path}: {e}")
                        continue
                
                if not cluster_images:
                    continue
                
                # Traitement des images par lots pour éviter les problèmes de mémoire
                all_embeddings = []
                for i in range(0, len(cluster_images), batch_size):
                    batch_images = cluster_images[i:i+batch_size]
                    
                    # Prétraitement des images
                    image_inputs = clip_processor(images=batch_images, return_tensors="pt", padding=True).to(device)
                    
                    # Obtention des embeddings
                    with torch.no_grad():
                        image_embeddings = clip_model.get_image_features(**image_inputs)
                    
                    # Normalisation
                    image_embeddings = image_embeddings / image_embeddings.norm(p=2, dim=-1, keepdim=True)
                    image_embeddings = image_embeddings.cpu().numpy()
                    all_embeddings.append(image_embeddings)
                
                # Combinaison de tous les embeddings du cluster
                if all_embeddings:
                    cluster_embeddings = np.vstack(all_embeddings)
                    
                    # Calcul de l'embedding moyen du cluster
                    cluster_centroid = np.mean(cluster_embeddings, axis=0)
                    cluster_centroid = cluster_centroid / np.linalg.norm(cluster_centroid)
                    
                    # Calcul des similarités avec chaque catégorie
                    similarities = cosine_similarity([cluster_centroid], category_embeddings)[0]
                    
                    # Normalisation des scores
                    if np.max(similarities) - np.min(similarities) > 1e-8:
                        normalized_similarities = (similarities - np.min(similarities)) / (np.max(similarities) - np.min(similarities))
                    else:
                        normalized_similarities = similarities
                    
                    # Sélection de la meilleure catégorie
                    best_cat_idx = np.argmax(normalized_similarities)
                    best_cat_score = normalized_similarities[best_cat_idx]
                    best_cat = predefined_categories[best_cat_idx]

                    for cat, sim in zip(predefined_categories, normalized_similarities):
                        print(f"{cat}: {sim:.3f}")
                    print("\n")

                    if len(image_paths) == 1:
                        best_cat = "Autres"
                    
                    # Assignation de la catégorie à toutes les images du cluster
                    # Vérifier si "Autres" est suffisamment proche du meilleur score
                    autres_index = predefined_categories.index("Autres")
                    autres_score = normalized_similarities[autres_index]
                    diff_with_best = best_cat_score - autres_score
                    
                    # Attribuer "Autres" si:
                    # - soit c'est déjà la meilleure catégorie (best_cat == "Autres")
                    # - soit son score est suffisamment proche du meilleur score (diff < 0.2) et qu'il n'est pas déjà le meilleur
                    formatted_date = day.replace(":", "_")
                    category = formatted_date + "_" + best_cat
                    if best_cat == "Autres" or (diff_with_best < threshold and best_cat != "Autres"):
                        category = "Autres"
                    
                    print(f"Cluster {cluster_name}: catégorie attribuée = {category} (score: {best_cat_score:.3f})")
                    
                    # Mise à jour du DataFrame
                    for path in valid_paths:
                        self.df.loc[self.df["path"] == path, "categories"] = category
        return self.df

    def pipeline(self, starting_time):
        print("RECHERCHE DES CATEGORIES AVEC CLUSTERING...")
        self.df = self.pipeline_categories_embedding_with_clusters()
        categories_time = time.time() - starting_time
        print(tabulate(self.df, headers="keys", tablefmt="psql"))
        print(f"Temps de recherche des catégories : {categories_time:.2f} secondes")
        
        self.dataframe_manager.df = self.df 
        self.dataframe_manager.save_to_csv(self.directory + ".csv")