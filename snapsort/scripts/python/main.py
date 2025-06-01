import shutil
import time
import os
import sys
sys.stdout.reconfigure(line_buffering=True)
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

from functions import create_category_folders_from_csv, set_parser, create_arborescence_from_csv
from categories_manager import CategoriesManager

if __name__ == "__main__":
    # Récupération des arguments de la commande (directory & destination)
    args = set_parser() 
    directory = args.directory
    destination_directory = args.destination_directory

    call = CategoriesManager(directory=directory)

    # Record du temps d'exécution
    starting_time = time.time()
    
    call.pipeline(starting_time)

    # Supprime le dossier de destination s'il existe déjà
    if os.path.exists(destination_directory):
        try:
            shutil.rmtree(destination_directory)
        except:
            print("L'arbre n'a pas pu être supprimé.")


    # Création du dossier de destination
    os.mkdir(destination_directory)
    #call.create_autres_subfolders(destination_directory)

    # Déduction de l'architecture depuis le csv
    create_arborescence_from_csv(directory + ".csv")
    # Création des dossiers et importation des images dans la destination
    create_category_folders_from_csv(directory + ".csv", destination_directory, test=False)

    # Rapport temps d'exécution
    total_time = time.time() - starting_time
    print(f"Temps total d'exécution : {total_time:.2f} secondes")
