import React, { useEffect, useState, useMemo } from 'react'
import { Table, Button, Flex, Breadcrumb } from "antd";
import "./TablePage.css"
import { $api } from '../../http';
import { Link } from 'react-router-dom';
import { NodeIndexOutlined, ProfileOutlined, TableOutlined } from '@ant-design/icons';

  const columns = [
    {
      title: 'Название файла',
      dataIndex: 'fileName',
      key: 'fileName',
    },
    {
      title: 'Действия',
      dataIndex: 'actions',
      key: 'actions',
    },
  ];

export const TablePage = () => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    $api.get("xml-files").then((res) => {
      setData(res.data)
    }).finally(() => {
      setIsLoading(false)
    })
  }, [])

  const dataSource = useMemo(() => {
    return data.map((el) => {
      return {
        key: el.id,
        fileName: el.file_name,
        actions : <Flex gap="small">
          <Link to={`/file/${el.id}`}><Button size='middle' type='primary'>Перейти к связям <NodeIndexOutlined /></Button></Link>
          <Link to={`/dictionary/${el.id}`}><Button size='middle' type='primary'>Перейти к терминам <ProfileOutlined /></Button></Link>
        </Flex> 
      }
    })
  }, [data])
  
  return (
    <div className='table-wrapper'>
      <Flex vertical gap="middle">
        <Breadcrumb 
          style={{fontSize: "25px"}}
          items={[
          { title: `Главная` },
          { title: 'Таблица файлов'}]} 
          separator={<TableOutlined  style={{fontSize: "25px"}} />}       
          />
        <Table loading={isLoading} columns={columns} dataSource={dataSource} pagination={{ pageSize: 6 }} />
      </Flex>
    </div>
    
  )
}
