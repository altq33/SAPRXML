from flask import Flask, request, jsonify
from flask_cors import CORS

from back.services import parse_xml, create_xml_files_table, create_xml_file_info_table, get_all_xml_files, \
    get_file_relationships, edit_relationship_by_id, get_terms_by_id, update_description, get_all_ontology, \
    add_ontology, delete_ontology_by_name, update_ontology

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


@app.route('/ontology', methods=['GET'])
def get_ontology():
    rows = get_all_ontology()
    res = [{'name': row[0], 'value_for_source': row[1], 'value_for_target': row[2]} for row in rows]
    return jsonify(res)


@app.route('/ontology', methods=['POST'])
def handle_ontology():
    data = request.get_json()
    name = data.get('name')
    value_for_source = data.get('value_for_source')
    value_for_target = data.get('value_for_target')
    add_ontology(name, value_for_source, value_for_target)
    return jsonify(message='Add Success')


@app.route('/ontology/<ontology_name>', methods=['PATCH'])
def patch_ontology(ontology_name):
    data = request.get_json()
    name = data.get('name')
    value_for_source = data.get('value_for_source')
    value_for_target = data.get('value_for_target')
    update_ontology(ontology_name, name, value_for_source, value_for_target)
    return jsonify(message='Update Success')


@app.route('/ontology/<ontology_name>', methods=['DELETE'])
def delete_ontology(ontology_name):
    delete_ontology_by_name(ontology_name)
    return jsonify(message='Delete Success')


@app.route('/get-relationships/<int:xml_file_id>', methods=['GET'])
def get_relationships(xml_file_id):
    return jsonify(get_file_relationships(xml_file_id))


@app.route('/get-relationships/<int:xml_file_id>/terms/<string:term_id>', methods=['GET'])
def get_relationships_term(xml_file_id, term_id):
    return jsonify(get_file_relationships(xml_file_id, term_id))


@app.route('/terms/<int:id>', methods=['GET'])
def get_terms(id):
    result = get_terms_by_id(id)
    return jsonify(result)


@app.route('/terms-description/<string:id>', methods=['PATCH'])
def update_xml_file_description(id):
    data = request.get_json()
    new_description = data['description']
    update_description(id, new_description)
    return jsonify({"message": "Description updated successfully"})


if __name__ == '__main__':
    app.run(debug=True)
