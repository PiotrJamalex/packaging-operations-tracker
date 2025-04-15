
#!/usr/bin/env python3
from flask import Flask, request, jsonify, Response
import os
import sys
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Default data file path
DEFAULT_DATA_PATH = "/app/data/data.json"

# Initialize empty data structure
def get_initial_data():
    return {
        "operations": [],
        "employees": [
            {"id": "aneta", "name": "Aneta"},
            {"id": "ewa", "name": "Ewa"},
            {"id": "adam", "name": "Adam"},
            {"id": "piotr", "name": "Piotr"}
        ],
        "machines": [
            {"id": "drukarka", "name": "Drukarka", "icon": "printer"},
            {"id": "autobox", "name": "Autobox", "icon": "package"},
            {"id": "bigówka", "name": "Bigówka", "icon": "scissors"}
        ],
        "projects": []
    }

# Ensure data file exists
def ensure_data_file(file_path):
    try:
        dir_path = os.path.dirname(file_path)
        # Create directory if it doesn't exist
        os.makedirs(dir_path, exist_ok=True)
        
        # Create file with initial data if it doesn't exist
        if not os.path.exists(file_path):
            with open(file_path, 'w') as f:
                json.dump(get_initial_data(), f, indent=2)
            print(f"Created new data file at {file_path}", file=sys.stderr)
            
        # Set permissions to ensure it's writable
        try:
            os.chmod(file_path, 0o666)
            os.chmod(dir_path, 0o777)
        except Exception as e:
            print(f"Warning: Could not set permissions: {str(e)}", file=sys.stderr)
        
        print(f"Data file ready at {file_path}", file=sys.stderr)
        return True
    except Exception as e:
        print(f"Error ensuring data file: {str(e)}", file=sys.stderr)
        return False

# Get data from file
def get_data_from_file(file_path):
    try:
        if not os.path.exists(file_path):
            # If file doesn't exist, create it with initial data
            ensure_data_file(file_path)
            
        with open(file_path, 'r') as f:
            data = json.load(f)
            print(f"Successfully read data from {file_path}", file=sys.stderr)
            return data
    except Exception as e:
        print(f"Error reading data file: {str(e)}", file=sys.stderr)
        # Return initial data if file can't be read
        return get_initial_data()

# Save data to file
def save_data_to_file(file_path, data):
    try:
        # Ensure directory exists
        dir_path = os.path.dirname(file_path)
        os.makedirs(dir_path, exist_ok=True)
        
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Successfully saved data to {file_path}", file=sys.stderr)
        return True
    except Exception as e:
        print(f"Error saving data: {str(e)}", file=sys.stderr)
        return False

@app.route('/data', methods=['GET', 'POST', 'OPTIONS'])
def handle_data():
    # For OPTIONS requests, return CORS headers immediately
    if request.method == 'OPTIONS':
        resp = app.make_default_options_response()
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type, X-File-Path'
        return resp
    
    # Get file path from header or use default
    file_path = request.headers.get('X-File-Path', DEFAULT_DATA_PATH)
    
    # Ensure data file exists
    ensure_data_file(file_path)
    
    if request.method == 'GET':
        try:
            data = get_data_from_file(file_path)
            print(f"Sending data from {file_path}", file=sys.stderr)
            # Ensure we always return JSON
            resp = Response(json.dumps(data), mimetype='application/json')
            resp.headers['Content-Type'] = 'application/json'
            return resp
        except Exception as e:
            print(f"Error processing GET request: {str(e)}", file=sys.stderr)
            error_resp = {"error": str(e)}
            return Response(json.dumps(error_resp), status=500, mimetype='application/json')
    
    elif request.method == 'POST':
        try:
            # Parse the JSON data from request
            data = request.get_json()
            
            if data is None:
                error_resp = {"error": "Invalid JSON data"}
                return Response(json.dumps(error_resp), status=400, mimetype='application/json')
                
            print(f"Saving data to {file_path}", file=sys.stderr)
            
            # Write the data to file
            if save_data_to_file(file_path, data):
                success_resp = {"success": True}
                return Response(json.dumps(success_resp), mimetype='application/json')
            else:
                error_resp = {"error": "Failed to save data"}
                return Response(json.dumps(error_resp), status=500, mimetype='application/json')
                
        except Exception as e:
            print(f"Error processing POST request: {str(e)}", file=sys.stderr)
            error_resp = {"error": str(e)}
            return Response(json.dumps(error_resp), status=500, mimetype='application/json')
    
    # Handle other methods
    error_resp = {"message": "Method not allowed"}
    return Response(json.dumps(error_resp), status=405, mimetype='application/json')

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    print("Starting file handler server on http://127.0.0.1:8000", file=sys.stderr)
    # Ensure data directory and file exist on startup
    ensure_data_file(DEFAULT_DATA_PATH)
    app.run(host='0.0.0.0', port=8000, debug=True)
