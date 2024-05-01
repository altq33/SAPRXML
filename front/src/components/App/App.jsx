import './App.css'
import { Flex } from 'antd'
import { InboxOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
const { Dragger } = Upload;
const props = {
  name: 'file',
  action: 'http://127.0.0.1:5000/upload-xml',
  accept: 'text/xml', 
  onChange(info) {
    const { status } = info.file;
    if (status === 'done') {
      message.success(`Файл ${info.file.name} успешно загружен.`);
    } else if (status === 'error') {
      message.error(`Ошибка при загрузке файла ${info.file.name}`);
    }
  },
  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files);
  },
};

export const App = () =>  {
  return (
   <Flex align='center' justify='center' className='main-container'>
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Щелкните или перетащите файл в эту область для загрузки</p>
        <p className="ant-upload-hint">
          Загрузите диаграмму в формате XML.
        </p>
      </Dragger>
   </Flex>
  )
}
