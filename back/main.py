from flask import Flask, request, jsonify
from flask_cors import CORS

from back.services import parse_xml, create_xml_files_table, create_xml_file_info_table, get_all_xml_files, \
	get_file_relationships, edit_relationship_by_id

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
		id = create_xml_files_table(file.filename)
		file_informaions = parse_xml(file.read())
		for file_informaion in file_informaions:
			if file_informaion['source'] is not None and file_informaion['target'] is not None and len(
					file_informaion['id']) > 2:
				create_xml_file_info_table(file_informaion['id'], file_informaion['value'], file_informaion['source'],
				                           file_informaion['target'], '', 'relationship', id)
			elif file_informaion['source'] is None and file_informaion['target'] is None and len(
					file_informaion['id']) > 2:
				create_xml_file_info_table(file_informaion['id'], file_informaion['value'], file_informaion['source'],
				                           file_informaion['target'], '', 'node', id)
		return "File uploaded successfully"

	return "Error uploading file"


@app.route('/relationship/edit/<string:id>', methods=['PATCH'])
def edit_relationship(id):
	value = request.json.get('value')
	edit_relationship_by_id(id, value)
	return jsonify(message='XML file info updated successfully')


@app.route('/xml-files', methods=['GET'])
def get_xml_files():
	rows = get_all_xml_files()
	files = [{'id': row[0], 'file_name': row[1]} for row in rows]
	return jsonify(files)


@app.route('/get-relationships/<int:xml_file_id>', methods=['GET'])
def get_relationships(xml_file_id):
	return jsonify(get_file_relationships(xml_file_id))



if __name__ == '__main__':
	app.run(debug=True)
