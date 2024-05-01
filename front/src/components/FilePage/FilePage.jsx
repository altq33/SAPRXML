import React, {useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import  { Table, Breadcrumb, Flex } from "antd"
import { $api } from '../../http';
import { LinkOutlined, ArrowRightOutlined } from '@ant-design/icons';
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
];

export const FilePage = () => {
    const [data, setData] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const { id } = useParams()
  
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
          label: <Flex justify='center' gap="small"><ArrowRightOutlined />{el.value}<ArrowRightOutlined /></Flex>
        }
      })
    }, [data, isLoading])
    
    return (
      <div className='table-wrapper'>
        <Flex vertical gap="middle">
            <Breadcrumb 
            style={{fontSize: "25px"}}
            items={[
             { title: `Файл ${data.file_name}` },
             { title: 'Связи'}]}
             separator={<LinkOutlined style={{fontSize: "25px"}} />} 
             
             />
            <Table loading={isLoading} columns={columns} dataSource={dataSource} pagination={{ pageSize: 6 }} />
        </Flex>
      </div>
    )
}
