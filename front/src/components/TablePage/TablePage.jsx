import React, { useEffect, useState, useMemo } from 'react'
import { Table, Button } from "antd";
import "./TablePage.css"
  import { $api } from '../../http';
  import { Link } from 'react-router-dom';

  const columns = [
    {
      title: 'Название файла',
      dataIndex: 'fileName',
      key: 'fileName',
    },
    {
      title: 'Связи',
      dataIndex: 'relationships',
      key: 'relationships',
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
        relationships : <Link to={`/file/${el.id}`}><Button size='middle' type='primary'>Перейти к связям</Button></Link>
      }
    })
  }, [data])
  
  return (
    <div className='table-wrapper'>
      <Table loading={isLoading} columns={columns} dataSource={dataSource} pagination={{ pageSize: 6 }} />
    </div>
    
  )
}
