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


def create_xml_files_table(file_name):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS xml_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_name TEXT
    )
    ''')

    cursor.execute('''
    INSERT INTO xml_files (file_name) VALUES (?)
    ''', (file_name,))

    conn.commit()

    cursor.execute('SELECT last_insert_rowid()')  # Получение id последней вставленной записи
    rowid = cursor.fetchone()[0]

    conn.close()

    return rowid


def create_xml_file_info_table(id, value, source, target, description, type, file_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # Создание таблицы xml_file_info
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS xml_file_info (
        id TEXT,
        value TEXT,
        source TEXT,
        target TEXT,
        description TEXT,
        type TEXT,
        xml_file_id INTEGER,
        FOREIGN KEY (xml_file_id) REFERENCES xml_files(id)
    )
    ''')

    # Вставка данных в таблицу xml_file_info
    cursor.execute('''
    INSERT INTO xml_file_info (id, value, source, target, description, type, xml_file_id) VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (id, value, source, target, description, type,
          file_id))  # Предполагается, что id таблицы xml_files совпадает с переданным id

    conn.commit()
    conn.close()


def get_all_xml_files():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM xml_files')
    rows = cursor.fetchall()

    conn.close()

    return rows


def get_file_relationships(xml_file_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, value, source, target, description, type FROM xml_file_info WHERE type='relationship' AND xml_file_id=?",
        (xml_file_id,))
    relationships = cursor.fetchall()

    cursor.execute("SELECT file_name FROM xml_files WHERE id=?", (xml_file_id,))
    file_name = cursor.fetchone()[0]

    result = []
    for relationship in relationships:
        source_id = relationship[2]
        target_id = relationship[3]

        cursor.execute("SELECT value FROM xml_file_info WHERE id=?", (source_id,))
        source_value = cursor.fetchone()[0]

        cursor.execute("SELECT value FROM xml_file_info WHERE id=?", (target_id,))
        target_value = cursor.fetchone()[0]

        result.append({
            'id': relationship[0],
            'value': relationship[1],
            'source_value': source_value,
            'target_value': target_value,
            'description': relationship[4],
            'type': relationship[5],
        })

    conn.close()

    return {'relationships': result, 'file_name': file_name}


def edit_relationship_by_id(id, value):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('UPDATE xml_file_info SET value = ? WHERE id = ?', (value, id))
    conn.commit()
    conn.close()


def get_terms_by_id(id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT id, value, description FROM xml_file_info WHERE xml_file_id = ? AND  type = 'node'", (id,))
    terms = cursor.fetchall()
    result = []
    for term in terms:
        result.append({
            'id': term[0],
            'term': term[1],
            'description': term[2]
        })

    cursor.execute("SELECT file_name FROM xml_files WHERE id=?", (id,))
    file_name = cursor.fetchone()[0]

    conn.close()
    return {'terms': result, 'file_name': file_name}


def update_description(id, new_description):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("UPDATE xml_file_info SET description = ? WHERE id = ?", (new_description, id))
    conn.commit()
    conn.close()
