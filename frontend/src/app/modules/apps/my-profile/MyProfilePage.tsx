import { FC } from 'react'
import { PageTitle } from '../../../../_metronic/layout/core'
import { MyProfileCard } from './components/MyProfileCard'

const MyProfilePage: FC = () => {
  return (
    <>
      <PageTitle breadcrumbs={[]}>ຂໍ້ມູນສ່ວນຕົວ</PageTitle>
      <MyProfileCard />
    </>
  )
}

export default MyProfilePage
