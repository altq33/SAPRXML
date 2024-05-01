from flask import Flask, request
from flask_cors import CORS

from back.services import parse_xml

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})


@app.route('/upload-xml', methods=['POST'])
def upload_xml():
	if 'file' not in request.files:
		return "No file part"

	file = request.files['file']

	if file.filename == '':
		return "No file selected"

	if file:
		print(parse_xml(file.read()))
		return "File uploaded successfully"

	return "Error uploading file"


if __name__ == '__main__':
	app.run(debug=True)
