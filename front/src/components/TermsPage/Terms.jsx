import React, {useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import  { Table, Breadcrumb, Flex, Modal, Button, Input, Form } from "antd"
import { $api } from '../../http';
import { ProfileOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
const columns = [
  {
    title: 'Термин',
    dataIndex: 'term',
    key: 'term',
  },
  {
    title: 'Описание',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Действия',
    dataIndex: 'actions',
    key: 'actions'
  }
];

export const TermsPage = () => {
    const [data, setData] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [currentEditTerm, setCurrentEditTerm] = useState({})
    const [isSendLoading, setIsSendLoading] = useState(false)
    const { id } = useParams()
    const [form] = Form.useForm();

  
    useEffect(() => {
      $api.get(`terms/${id}`).then((res) => {
        setData(res.data)
      }).finally(() => {
        setIsLoading(false)
      })
    }, [])
  
    const dataSource = useMemo(() => {
      if(isLoading) return []
      return data?.terms.map((el) => {
        return {
          key: el.id,
          term:  <Link className='table-link' to={`/links/${id}/terms/${el.id}`}>{el.term}</Link>,
          description: el.description,
          actions: <Button type='primary' onClick={() => {
            setCurrentEditTerm({
              id: el.id,
              term: el.term,
              description: el.description,
            })
            setIsEditOpen(true)
          }}>{el.description ? <>Редактировать описание <EditOutlined /></> : <>Добавить описание <PlusOutlined /></>} </Button>
        }
      })
    }, [data, isLoading])

    useEffect(() => {
      if(currentEditTerm.description !== null || currentEditTerm.description !== undefined) {
        form.setFieldValue('description', currentEditTerm.description)
      } 
    }, [currentEditTerm.description])

    

    const handleSubmit = useCallback(async () => {
        try {
          setIsSendLoading(true)
          const { description } = await form.validateFields()
          await $api.patch(`terms-description/${currentEditTerm.id}`, {description: description})
          setData((prev) => {
            return { ...prev,terms: prev?.terms.map(el => {
            if(el.id === currentEditTerm.id) {
              return { ...el, description: description }
            } 
            return el
           })}})
          setIsEditOpen(false)
          setCurrentEditTerm({})
        } catch (err) {
          console.error(err)
        } finally {
          setIsSendLoading(false)
        }
    }, [currentEditTerm])
    
    return (
      <>
        <Modal
        title={currentEditTerm.description ? `Редактировать описание ${currentEditTerm.id}` : `Добавить описание ${currentEditTerm.id}`}
        open={isEditOpen}
        confirmLoading={isSendLoading}
        onCancel={() => {
          setIsEditOpen(false)
          setCurrentEditTerm({})
        }}
        onOk={handleSubmit}
        cancelText='Отмена'
        >
          <Form layout="vertical" form={form}>
            <Flex vertical gap={'small'}>
              <Form.Item name='description' label='Описание' colon={false} rules={[{required: true, message: 'Поле обязательно к заполнению!'}]}>
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
              { title: 'Термины'}]} 
              separator={<ProfileOutlined style={{fontSize: "25px"}} />}       
              />
              <Table loading={isLoading} columns={columns} dataSource={dataSource} pagination={{ pageSize: 8 }} />
          </Flex>
        </div>
      </> 
    )
}
