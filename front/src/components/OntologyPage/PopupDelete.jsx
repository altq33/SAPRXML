import React, { useState } from 'react'
import  {  Button, Popconfirm } from "antd"
import { $api } from '../../http';
import { DeleteOutlined, QuestionCircleOutlined  } from '@ant-design/icons';

export const PopupDelete = ({name, onDelete}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const showPopconfirm = () => {
        setIsOpen(true);
      };

    const handleOk = async () => {
        try {
           setIsLoading(true);
           await  $api.delete(`/ontology/${name}`)
           setIsOpen(false);
           setIsLoading(false);
           onDelete()
        } catch (error) {
        } finally {
            setIsOpen(false);
            setIsLoading(false);
        }
     
 
    };

    const handleCancel = () => {
        setIsOpen(false);
    };

    return (
        <Popconfirm
        title="Удалить данную запись?"
        description=''
        onConfirm={handleOk}
        onCancel={handleCancel}
        okText="Да"
        open={isOpen}
        placement='right'
        zIndex={999}
        cancelText="Нет"
        icon={
            <QuestionCircleOutlined
            style={{
                color: 'red',
            }}
            />
        }
        okButtonProps={{
            loading: isLoading,
        }}
    >
        <Button danger onClick={showPopconfirm}>
            Удалить <DeleteOutlined color='red'/>
        </Button>
    </Popconfirm>
  )
}
