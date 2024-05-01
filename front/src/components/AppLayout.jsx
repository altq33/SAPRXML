import React from 'react';
import { Layout, Flex } from 'antd';
import { FileAddTwoTone } from '@ant-design/icons'
import { NavLink, Outlet } from 'react-router-dom';
import { ConfigProvider } from 'antd';
const { Header, Content, Footer } = Layout;

const navLinks = [
  {key: 0, label: 'Главная', link: '/'},
  {key: 1, label: 'Таблица загруженных файлов', link: '/diagrams-table'}
]

export const AppLayout = () => {

  return (
    <ConfigProvider
    theme={{
      token: {
        // Seed Token
        colorPrimary: 'green',
        borderRadius: 2,

      },
    }}
  >
    <Layout style={{minHeight: "100%"}}>
      <Header>
          <Flex gap={'middle'}>
            <h1 style={{color: 'green'}}>SAPRXML</h1>
            <FileAddTwoTone twoToneColor="green" style={{ fontSize: '32px'}} />
            {navLinks.map((el) => <NavLink className='nav-link' key={el.key} to={el.link}>{el.label}</NavLink>)}
          </Flex>
      </Header>
      <Content style={{ padding: '0 48px', flex: '1 1 auto' }} >
          <Outlet />
      </Content>
    </Layout>
  </ConfigProvider>
  );
};
