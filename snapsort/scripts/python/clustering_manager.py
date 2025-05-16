from PIL import Image
import numpy as np
import torch
from transformers import CLIPProcessor, CLIPModel

class ClusteringManager:
    def __init__(self, df, device="cpu"):
        self.df = df
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.clip_model = CLIPModel.from_pretrained("laion/CLIP-ViT-L-14-laion2B-s32B-b82K").to(self.device)
        self.clip_processor = CLIPProcessor.from_pretrained("laion/CLIP-ViT-L-14-laion2B-s32B-b82K")
        
    def image_embedding(self, paths):
        images = []
        for path in paths:
            try:
                image = Image.open(path).convert("RGB")
                images.append(image)
            except Exception as e:
                print(f"Erreur lors du chargement de l'image {path}: {e}")
                continue

        if not images:
            return None

        # Prétraitement des images en batch
        image_inputs = self.clip_processor(images=images, return_tensors="pt", padding=True).to(self.device)

        with torch.no_grad():
            image_embeddings = self.clip_model.get_image_features(**image_inputs)

        # Normalisation
        image_embeddings = image_embeddings / image_embeddings.norm(p=2, dim=-1, keepdim=True)
        image_embeddings = image_embeddings.cpu().numpy()

        return image_embeddings

    def day_sorting(self):
        days = {}
        for index, row in self.df.iterrows():
            date = row["date_time"]
            if date:
                day = date.split(" ")[0]
                if day not in days:
                    days[day] = []
                days[day].append(row["path"])

        return days

    def days_embedding(self, days_dict):
        embeddings_dict = {}
        for day, images in days_dict.items():
            print(f"Génération des embeddings pour le jour: {day}")
            embeddings = self.image_embedding(images)
            
            if embeddings is None:
                continue
                
            embeddings_dict[day] = []
            for i, image in enumerate(images):
                if i < len(embeddings):  # Protection contre les indices hors limites
                    embeddings_dict[day].append({
                        'path': image,
                        'embedding': embeddings[i]
                    })
        return embeddings_dict

    def neighbors_similarity_clustering(self, embeddings_dict, threshold=0.6, n_neighbors=3):
        clusters_by_day = {}
        global_cluster_id = 0  # Compteur global pour l'ID de cluster
        
        for day, image_list in embeddings_dict.items():
            paths = [image['path'] for image in image_list]
            embeddings = np.array([image['embedding'] for image in image_list])
            N = len(paths)
            
            clusters = {}
            current_cluster = []
            already_clustered = set()
            
            print(f"Clustering du jour {day} avec {N} images...")
            
            for i in range(N):
                current_img = paths[i]
                if current_img in already_clustered:
                    continue
                    
                # Calculer les similarités avec les n voisins suivants
                end_idx = min(i + n_neighbors + 1, N)
                similar_images = []
                
                # Ajouter l'image courante au cluster si pas encore clustérisée
                if current_img not in already_clustered:
                    current_cluster.append(current_img)
                    already_clustered.add(current_img)
                    
                # Chercher des images similaires parmi les voisins
                for j in range(i + 1, end_idx):
                    sim = np.dot(embeddings[i], embeddings[j])
                    if sim > threshold:
                        neighbor_img = paths[j]
                        if neighbor_img not in already_clustered:
                            current_cluster.append(neighbor_img)
                            already_clustered.add(neighbor_img)
                            similar_images.append(neighbor_img)
                
                # Si aucune image similaire trouvée et qu'on a un cluster en cours, finaliser le cluster
                if not similar_images and len(current_cluster) > 0:
                    cluster_name = f"cluster_{global_cluster_id}"  # Utiliser l'ID global
                    clusters[cluster_name] = current_cluster.copy()
                    current_cluster = []
                    global_cluster_id += 1  # Incrémenter l'ID global
            
            # Traitement du dernier cluster s'il n'est pas vide
            if current_cluster:
                cluster_name = f"cluster_{global_cluster_id}"  # Utiliser l'ID global
                clusters[cluster_name] = current_cluster
                global_cluster_id += 1  # Incrémenter l'ID global
            
            # Collecter les images non clustérisées dans "others"
            other_cluster = []
            for path in paths:
                found = False
                for cluster_name, cluster_images in clusters.items():
                    if path in cluster_images:
                        found = True
                        break
                if not found:
                    other_cluster.append(path)
            
            if other_cluster:
                clusters["others"] = other_cluster
                
            clusters_by_day[day] = clusters
        
        return clusters_by_day

    def perform_neighbors_clustering(self, threshold=0.6, n_neighbors=3):
        print("Début du clustering par voisins proches...")
        days_dict = self.day_sorting()
        embeddings_dict = self.days_embedding(days_dict)
        clusters = self.neighbors_similarity_clustering(embeddings_dict, threshold, n_neighbors)
        
        # Mise à jour du DataFrame avec les informations de cluster
        cluster_mapping = {}
        for day, day_clusters in clusters.items():
            for cluster_name, image_paths in day_clusters.items():
                for path in image_paths:
                    cluster_mapping[path] = cluster_name
        
        self.df['cluster'] = self.df['path'].map(cluster_mapping)
        
        return self.df, clusters