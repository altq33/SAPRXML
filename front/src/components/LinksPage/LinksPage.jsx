import React, {useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import  { Table, Breadcrumb, Flex, Modal, Button, Input, Form } from "antd"
import { $api } from '../../http';
import { NodeIndexOutlined, ArrowRightOutlined, EditOutlined } from '@ant-design/icons';
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
    const { id } = useParams()
    const [searchParams, setSearchParams] = useSearchParams();
    const [form] = Form.useForm();
    console.log(searchParams.termId)

    useEffect(() => {
      $api.get(`get-relationships/${id}`).then((res) => {
        setData(res.data)
      }).finally(() => {
        setIsLoading(false)
      })
    }, [])
  
    const dataSource = useMemo(() => {
      if(isLoading) return []
      return data?.relationships.map((el) => {
        return {
          key: el.id,
          source: el.source_value,
          target: el.target_value,
          label: <Flex justify='center' gap="small"><ArrowRightOutlined />{el.value}<ArrowRightOutlined /></Flex>,
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
              items={[
              { title: `Файл ${data.file_name}` },
              { title: 'Связи'}]} 
              separator={<NodeIndexOutlined style={{fontSize: "25px"}} />}       
              />
              <Table loading={isLoading} columns={columns} dataSource={dataSource} pagination={{ pageSize: 6 }} />
          </Flex>
        </div>
      </> 
    )
}
