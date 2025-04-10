
#!/usr/bin/env python3
from flask import Flask, request, jsonify
import os
import sys
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/get_data', methods=['GET'])
def get_data():
    # Get the target file path from the header
    file_path = request.headers.get('X-File-Path')
    
    if not file_path:
        return jsonify({"error": "No file path provided"}), 400
    
    try:
        # Check if file exists, if not initialize it
        if not os.path.exists(file_path):
            # Create directory if it doesn't exist
            dir_path = os.path.dirname(file_path)
            os.makedirs(dir_path, exist_ok=True)
            
            # Create initial empty data structure
            initial_data = {
                "operations": [],
                "employees": [],
                "machines": [],
                "projects": []
            }
            
            # Write the initial data
            with open(file_path, 'w') as f:
                json.dump(initial_data, f, indent=2)
            
            print(f"Initialized new data file at {file_path}", file=sys.stderr)
            return jsonify(initial_data), 200
        
        # Read data from file
        print(f"Reading data from {file_path}", file=sys.stderr)
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        return jsonify(data), 200
    except Exception as e:
        print(f"Error reading data: {str(e)}", file=sys.stderr)
        return jsonify({"error": str(e)}), 500

@app.route('/save_data', methods=['POST'])
def save_data():
    # Get the target file path from the header
    file_path = request.headers.get('X-File-Path')
    
    if not file_path:
        return jsonify({"error": "No file path provided"}), 400
    
    # Get the directory path
    dir_path = os.path.dirname(file_path)
    
    # Create directory if it doesn't exist
    os.makedirs(dir_path, exist_ok=True)
    
    try:
        # Parse the JSON data
        data = request.get_json()
        
        if data is None:
            return jsonify({"error": "Invalid JSON data"}), 400
            
        print(f"Saving data to {file_path}: {str(data)[:100]}...", file=sys.stderr)
        
        # Write the updated data to the file
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"Data successfully saved to {file_path}", file=sys.stderr)
        return jsonify({"success": True}), 200
    except Exception as e:
        print(f"Error saving data: {str(e)}", file=sys.stderr)
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    print("Starting file handler server on http://127.0.0.1:8000", file=sys.stderr)
    app.run(host='127.0.0.1', port=8000, debug=True)
