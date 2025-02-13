import os
import json
from pathlib import Path

def directory_to_json(directory_path, output_json_path):
    # Ensure the directory exists
    if not os.path.isdir(directory_path):
        print(f"The directory {directory_path} does not exist.")
        return

    # Get a list of all files in the directory
    files = [f for f in os.listdir(directory_path) if os.path.isfile(os.path.join(directory_path, f))]

    # Create a list of JSON objects, each representing a file
    files_json = [{"name": file} for file in files]

    # Write the JSON array to the output file
    with open(output_json_path, 'w') as json_file:
        json.dump(files_json, json_file, indent=4)

    print(f"JSON file created successfully at {output_json_path}")

if __name__ == "__main__":
    directory_to_json("./DungeonLayout/", "DungeonLayout.json")
    directory_to_json("./DungeonModule/", "DungeonModule.json")