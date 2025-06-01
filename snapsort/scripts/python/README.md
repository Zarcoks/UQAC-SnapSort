### Creating python venv
```
python -m venv .
```

### Installing depencies
```
pip install -r .\snapsort\scripts\python\requirements.txt
```

### Run the sorter
```
python main.py --directory {your_directory} --destination_directory {your_destination_directory}
```

1. The default values for arguments are "unsorted_images" for *directory* and "album" for *destination_directory*
2. This will create .csv where you will find how the IA recommends to organise the images
3. The csv file follows this template: image_name,path,date_time,latitude,longitude,cluster,categories


### Run the tests
```
python -m snapsort.scripts.python.tests.main
```
