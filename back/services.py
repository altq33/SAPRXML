from lxml import etree
import sqlite3

DB_NAME = 'xml_sapr'

def parse_xml(file_contents):
	root = etree.fromstring(file_contents)
	elements = []
	for obj in root.findall('.//mxCell'):
		xml_element = \
			{'id': obj.get('id'),
			 'value': obj.get('value'),
			 'source': obj.get('source'),
			 'target': obj.get('target')
			 }
		elements.append(xml_element)

	return elements


def create_table(objects, filename):
    count = 0
    tables = get_existing_tables()
    for table in tables:
        if table == filename:
            count += 1
    if count == 0:
        connect = sqlite3.connect(DB_NAME)
        cursor = connect.cursor()
        cursor.execute(f'''CREATE TABLE IF NOT EXISTS {filename}(
                          id TEXT PRIMARY KEY,
                          value TEXT,
                          source TEXT,
                          target TEXT,
                          description TEXT, 
                          type TEXT)''')

        connect.commit()

        for obj in objects:
            if obj['source'] is not None and obj['target'] is not None and len(obj['id']) > 2:
                cursor.execute(
                    f"INSERT INTO {filename} (id, value, source, target, description, type) VALUES (?, ?, ?, ?, ?, ?)",
                    (obj['id'], obj['value'], obj['source'], obj['target'], '', 'relationship'))
            elif obj['source'] is None and obj['target'] is None and len(obj['id']) > 2:
                cursor.execute(
                    f"INSERT INTO {filename} (id, value, source, target, description, type) VALUES (?, ?, ?, ?, ?, ?)",
                    (obj['id'], obj['value'], obj['source'], obj['target'], '', 'object'))
        connect.commit()
    else:
        print('')
