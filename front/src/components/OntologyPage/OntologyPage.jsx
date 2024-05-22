import React, {useState, useEffect, useMemo, useCallback } from 'react'
import  { Table, Breadcrumb, Flex, Modal, Button, Input, Form } from "antd"
import { $api } from '../../http';
import { EditOutlined, SwapOutlined, PlusOutlined } from '@ant-design/icons';
import { PopupDelete } from './PopupDelete';
const columns = [
  {
    title: 'Название',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Значение для источника',
    dataIndex: 'valueForSource',
    key: 'valueForSource',
  },
  {
    title: 'Значение для цели',
    dataIndex: 'valueForTarget',
    key: 'valueForTarget',
  },
  {
    title: 'Действия',
    dataIndex: 'actions',
    key: 'actions'
  }
];

export const OntologyPage = () => {
    const [data, setData] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [currendEditData, setCurrentEditData] = useState({})
    const [isSendLoading, setIsSendLoading] = useState(false)
    const [isAddLoading, setIsAddLoading] = useState(false)
    const [mode, setMode] = useState('')
    const [form] = Form.useForm();
    
    useEffect(() => {
        $api.get(`/ontology`).then((res) => {
          setData(res.data)
        }).finally(() => {
          setIsLoading(false)
        })
    }, [])
  
    const dataSource = useMemo(() => {
      if(isLoading) return []
      return data?.map((el) => {
        return {
          key: el.name,
          name: el.name,
          valueForSource: el.value_for_source,
          valueForTarget: el.value_for_target,
          actions: <Flex gap="small">
            <Button type='primary' onClick={() => {
            setCurrentEditData({
                name: el.name,
                valueForSource: el.value_for_source,
                valueForTarget: el.value_for_target,
            })
            setMode('edit')
            setIsEditOpen(true)
          }}>Редактировать <EditOutlined /></Button>
            <PopupDelete name={el.name} onDelete={() => setData((prev) => prev.filter((dataEl) => dataEl.name !== el.name))}/>
          </Flex>
        }
      })
    }, [data, isLoading])

    useEffect(() => {
      if(currendEditData.name && currendEditData.valueForSource && currendEditData.valueForTarget) {
        form.setFieldValue('name', currendEditData.name)
        form.setFieldValue('valueForSource', currendEditData.valueForSource)
        form.setFieldValue('valueForTarget', currendEditData.valueForTarget)
      } 
    }, [currendEditData.name, currendEditData.valueForSource, currendEditData.valueForTarget])

    const handleSubmit = useCallback(async () => {
        try {
          setIsSendLoading(true)
          const { name, valueForSource, valueForTarget } = await form.validateFields()
          await $api.patch(`/ontology/${currendEditData.name}`, {name, value_for_target: valueForTarget, value_for_source: valueForSource})
          setData((prev) => {
            return prev.map((el) => {
                if(el.name == currendEditData.name) {
                    return {name, value_for_target: valueForTarget, value_for_source: valueForSource}
                }
                return el
            })
          })
          setIsEditOpen(false)
          setCurrentEditData({})
          form.resetFields()
        } catch (err) {
          console.error(err)
        } finally {
          setIsSendLoading(false)
        }
    }, [currendEditData])

    const handleAdd = useCallback(async () => {
        try {
            setIsAddLoading(true)
            const { name, valueForSource, valueForTarget } = await form.validateFields()
            await $api.post(`/ontology`, {name, value_for_target: valueForTarget, value_for_source: valueForSource})
            setData((prev) => {
                return [...prev, {name, value_for_target: valueForTarget, value_for_source: valueForSource}]
            })
            form.resetFields()
            setIsEditOpen(false)
          } catch (err) {
            console.error(err)
          } finally {
            setIsAddLoading(false)
          }
    }, [])


    return (
      <>
        <Modal
        title={mode === 'edit' ? `Редактировать ${currendEditData.name}` : 'Добавить запись'}
        open={isEditOpen}
        confirmLoading={mode === 'edit' ? isSendLoading : isAddLoading}
        onCancel={() => {
          setIsEditOpen(false)
          setCurrentEditData({})
        }}
        onOk={mode === 'edit' ? handleSubmit : handleAdd}
        cancelText='Отмена'
        >
          <Form layout="vertical" form={form}>
            <Flex vertical gap={'small'}>
              <Form.Item name='name' label='Название' colon={false} rules={[{required: true, message: 'Поле обязательно к заполнению!'}]}>
                <Input />
              </Form.Item>
              <Form.Item name='valueForSource' label='Значение для источника' colon={false} rules={[{required: true, message: 'Поле обязательно к заполнению!'}]}>
                <Input />
              </Form.Item>
              <Form.Item name='valueForTarget' label='Значение для цели' colon={false} rules={[{required: true, message: 'Поле обязательно к заполнению!'}]}>
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
                { title: `Онтология` },
                { title: 'Словарь'}]} 
                separator={<SwapOutlined style={{fontSize: "25px"}}/>}       
                />
                <Button type='primary' style={{width: 'fit-content'}} onClick={() => {
                    setMode('add')
                    setIsEditOpen(true)
                }}>Добавить запись <PlusOutlined /></Button>
              <Table loading={isLoading} columns={columns} dataSource={dataSource} pagination={{ pageSize: 6 }} />
          </Flex>
        </div>
      </> 
    )
}
