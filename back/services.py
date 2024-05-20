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
    if type == 'node':
        create_terms_table(id, value, file_id, description)
    elif type == 'relationship':
        create_links_table(id, value, source, target, file_id)


def create_terms_table(id, value, file_id, description):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute('''
      CREATE TABLE IF NOT EXISTS terms (
          id TEXT,
          value TEXT,
          description TEXT,
          xml_file_id INTEGER,
          FOREIGN KEY (xml_file_id) REFERENCES xml_files(id)
      )
      ''')

    cursor.execute('''
       INSERT INTO terms (id, value,  description, xml_file_id) VALUES (?, ?, ?, ?)
       ''', (id, value, description, file_id))

    conn.commit()
    conn.close()


def create_links_table(id, value, source, target, file_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute('''
         CREATE TABLE IF NOT EXISTS links (
             id TEXT,
             value TEXT,
             source TEXT,
             target TEXT,
             xml_file_id INTEGER,
             FOREIGN KEY (xml_file_id) REFERENCES xml_files(id)
             FOREIGN KEY (source) REFERENCES terms(id)
             FOREIGN KEY (target) REFERENCES terms(id)
         )  
         ''')

    cursor.execute('''
          INSERT INTO links (id, value,  source, target, xml_file_id) VALUES (?, ?, ?, ?, ?)
          ''', (id, value, source, target, file_id))

    conn.commit()
    conn.close()


def get_all_xml_files():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM xml_files')
    rows = cursor.fetchall()

    conn.close()

    return rows


def get_file_relationships(xml_file_id, term_id=None):
    term = []
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    if term_id:
        cursor.execute(
            "SELECT id, value, source, target FROM links WHERE xml_file_id=? AND (source = ? OR target = ?)",
            (xml_file_id, term_id, term_id,))
    else:
        cursor.execute(
            "SELECT id, value, source, target FROM links WHERE xml_file_id=?",
            (xml_file_id,))

    relationships = cursor.fetchall()

    cursor.execute("SELECT file_name FROM xml_files WHERE id=?", (xml_file_id,))
    file_name = cursor.fetchone()[0]

    if term_id:
        cursor.execute("SELECT id, value, description FROM terms WHERE id=?", (term_id,))
        term = cursor.fetchone()

    result = []
    for relationship in relationships:
        source_id = relationship[2]
        target_id = relationship[3]

        cursor.execute("SELECT value, id FROM terms WHERE id=?", (source_id,))
        source_value = cursor.fetchone()[0]

        cursor.execute("SELECT value, id FROM terms WHERE id=?", (target_id,))
        target_value = cursor.fetchone()[0]

        result.append({
            'id': relationship[0],
            'value': relationship[1],
            'source_value': source_value,
            'target_value': target_value,
            'target_id': target_id,
            'source_id': source_id,
        })

    conn.close()
    if term_id:
        return {'relationships': result, 'file_name': file_name, 'term': {'id': term[0], 'value': term[1], 'description': term[2]}}

    return {'relationships': result, 'file_name': file_name}


def edit_relationship_by_id(id, value):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('UPDATE links SET value = ? WHERE id = ?', (value, id))
    conn.commit()
    conn.close()


def get_terms_by_id(id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT id, value, description FROM terms WHERE xml_file_id = ?", (id,))
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
    cursor.execute("UPDATE terms SET description = ? WHERE id = ?", (new_description, id))
    conn.commit()
    conn.close()
