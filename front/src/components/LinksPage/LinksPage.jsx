import React, {useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, Link} from 'react-router-dom'
import  { Table, Breadcrumb, Flex, Modal, Button, Input, Form, Descriptions } from "antd"
import { $api } from '../../http';
import { NodeIndexOutlined, ArrowRightOutlined, ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
const columns = [
  {
    title: 'Источник',
    dataIndex: 'source',
    key: 'source',
  },
  {
    title: 'Подпись',
    dataIndex: 'label',
    key: 'label',
  },
  {
    title: 'Цель',
    dataIndex: 'target',
    key: 'target',
  },
  {
    title: 'Действия',
    dataIndex: 'actions',
    key: 'actions'
  }
];

export const LinksPage = () => {
    const [data, setData] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [currendEditRelationship, setCurrentEditRelationship] = useState({})
    const [isSendLoading, setIsSendLoading] = useState(false)
    const { id, termId } = useParams()
    const [form] = Form.useForm();
    
    useEffect(() => {
      if(!termId) {
        $api.get(`get-relationships/${id}`).then((res) => {
          setData(res.data)
        }).finally(() => {
          setIsLoading(false)
        })
      } else {
        $api.get(`get-relationships/${id}/terms/${termId}`).then((res) => {
          setData(res.data)
        }).finally(() => {
          setIsLoading(false)
        })
      }
      
    }, [termId, id])
  
    const dataSource = useMemo(() => {
      if(isLoading) return []
      return data?.relationships.map((el) => {
        return {
          key: el.id,
          source: termId == el.target_id ?  <Link className='table-link'  to={`/links/${id}/terms/${el.target_id}`}>{el.target_value}</Link> : <Link className='table-link' to={`/links/${id}/terms/${el.source_id}`}>{el.source_value}</Link>,
          target:     termId == el.target_id ? <Link className='table-link' to={`/links/${id}/terms/${el.source_id}`}>{el.source_value}</Link> :
          <Link className='table-link'  to={`/links/${id}/terms/${el.target_id}`}>{el.target_value}</Link>,
          label:
          termId == el.target_id ?   
          <Flex justify='center' gap="small"><ArrowLeftOutlined />{el.value}<ArrowLeftOutlined />
          </Flex> 
          :
          <Flex justify='center' gap="small"><ArrowRightOutlined />{el.value}<ArrowRightOutlined /></Flex>,
          actions: <Button type='primary' onClick={() => {
            setCurrentEditRelationship({
              id: el.id,
              source: el.source_value,
              target: el.target_value,
              label: el.value
            })
            setIsEditOpen(true)
          }}>Редактировать <EditOutlined /></Button>
        }
      })
    }, [data, isLoading])

    useEffect(() => {
      if(currendEditRelationship.label) {
        form.setFieldValue('label', currendEditRelationship.label)
      } 
    }, [currendEditRelationship.label])

    const descriptionItems = useMemo(() => [
      {
        key: '1',
        label: 'Описание',
        children: <p>{ isLoading ? 'Загрузка...' : data.term?.description || 'Описание отсутствует'}</p>,
      },
      {
        key: '2',
        label: 'ID',
        children: <p>{ isLoading ? 'Загрузка...' : data.term?.id || 'ID отсутствует'}</p>,
      },
      {
        key: '3',
        label: 'Значение',
        children: <p>{ isLoading ? 'Загрузка...' : data.term?.value || 'Значение отсутствует'}</p>,
      },
    ], [isLoading, data.term?.description, data.term?.id, data.term?.value])

    

    const handleSubmit = useCallback(async () => {
        try {
          setIsSendLoading(true)
          const { label } = await form.validateFields()
          await $api.patch(`relationship/edit/${currendEditRelationship.id}`, {value: label})
          setData((prev) => {
            return { ...prev,relationships: prev?.relationships.map(el => {
            if(el.id === currendEditRelationship.id) {
              return { ...el, value: label }
            } 
            return el
           })}})
          setIsEditOpen(false)
          setCurrentEditRelationship({})
        } catch (err) {
          console.error(err)
        } finally {
          setIsSendLoading(false)
        }
    }, [currendEditRelationship])

    const breadcrubmsItems = termId ? [
      { title: `Файл ${data.file_name ?? 'Загрузка...'}` },
      {
        type: 'separator',
      },
      { title: `Термин ${data.term?.value  ?? 'Загрузка...'}`},
      {type: 'separator', separator: <NodeIndexOutlined style={{fontSize: "25px"}} />},
      { title: 'Связи'}] :  [{ title: `Файл ${data.file_name  ?? 'Загрузка...'}` },
      {type: 'separator', separator: <NodeIndexOutlined style={{fontSize: "25px"}} />},
      { title: 'Связи'}]

    return (
      <>
        <Modal
        title={`Редактировать ${currendEditRelationship.id}`}
        open={isEditOpen}
        confirmLoading={isSendLoading}
        onCancel={() => {
          setIsEditOpen(false)
          setCurrentEditRelationship({})
        }}
        onOk={handleSubmit}
        cancelText='Отмена'
        >
          <Form layout="vertical" form={form}>
            <Flex vertical gap={'small'}>
              <Form.Item name='label' label='Название связи' colon={false} rules={[{required: true, message: 'Поле обязательно к заполнению!'}]}>
                <Input />
              </Form.Item>
            </Flex>
          </Form>
        </Modal>
        <div className='table-wrapper'>
          <Flex vertical gap="middle">
              <Breadcrumb 
              style={{fontSize: "25px"}}
              items={breadcrubmsItems}   
              separator=""    
              />
              {termId && <Descriptions style={{maxWidth: '850px'}} title="Информация" items={descriptionItems}  labelStyle={{color: 'green'}} size="default" />}  
              <Table loading={isLoading} columns={columns} dataSource={dataSource} pagination={{ pageSize: 6 }} />
          </Flex>
        </div>
      </> 
    )
}
