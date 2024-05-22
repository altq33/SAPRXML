import React from 'react';
import { Layout, Flex, Tag } from 'antd';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import XMLIcon from "../assets/xml-svgrepo-com.svg?react"
import { GithubOutlined } from '@ant-design/icons';
const { Header, Content } = Layout;

const navLinks = [
  {key: 0, label: 'Главная', link: '/'},
  {key: 1, label: 'Таблица загруженных файлов', link: '/diagrams-table'},
  {key: 2, label: 'Словарь онтологии', link: '/ontology'}
]

export const AppLayout = () => {

  return (
    <ConfigProvider
    theme={{
      token: {
        // Seed Token
        colorPrimary: 'green',
        borderRadius: 6,

      },
    }}
  >
    <Layout style={{minHeight: "100%"}}>
      <Header>
          <Flex gap={'middle'} >
            <Link to="/">
              <Flex gap={'middle'} align='center'>
                <h1 style={{color: 'green'}}>SAPRXML</h1>
                <XMLIcon width={32} height={32} />
              </Flex>         
            </Link>
            {navLinks.map((el) => <NavLink className='nav-link' key={el.key} to={el.link}>{el.label}</NavLink>)}
            <Flex className='link-container' align="center" gap='small' style={{whiteSpace: 'nowrap'}} >
              <span style={{whiteSpace: 'nowrap'}}>Made by</span><a className='github-link' href='https://github.com/altq33'>altq33 <GithubOutlined /></a>
            </Flex>
          </Flex>
      </Header>
      <Content style={{ padding: '0 48px', flex: '1 1 auto' }} >
          <Outlet />
      </Content>
    </Layout>
  </ConfigProvider>
  );
};
