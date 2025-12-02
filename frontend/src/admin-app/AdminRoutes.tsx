import React from 'react'
import { useAppSelector } from '../redux/hooks'
import User, { RoleType } from '../models/User'
import { selectUserData } from '../redux/actions/login/loginSlice'
import { element } from 'prop-types'
import AllClientLedger from './pages/ledger/AllClientLedger'
import TotalProfit from './pages/ledger/TotalProfit'
import CommisionLenden from './pages/ledger/CommisionLenden'
import LedgerHome from './pages/ledger/LedgerHome'
import AllReport from './pages/ledger/AllReport'
import SportsDetails from './pages/SportsDetail/SportsDetails'
import Inplaygames from './pages/ledger/Inplaygames'
import CasinoPL from './pages/ledger/CasinoPL'
import AdminUseras from './pages/list-clients/modals/AdminUseras'
import SingleLedger from './pages/ledger/SingleLedger'
import Operation from './pages/AccountStatement/Operation'
import Completedbets from './pages/SportsDetail/Completedbets'
import RejectedBets from './pages/SportsDetail/RejectedBets'
import ReportBets from './pages/SportsDetail/ReportBets'
import ClientBetsLedger from './pages/SportsDetail/ClientBetsLedger'
import CasinoDetail from './pages/SportsDetail/CasinoDetail'


const ActiveMarkets = React.lazy(() => import('../admin-app/pages/active-matches/active-markets'))
const ActiveMatches = React.lazy(() => import('../admin-app/pages/active-matches/active-matches'))
const GetAllFancy = React.lazy(() => import('../admin-app/pages/active-matches/get-all-fancy'))
const MatchesPage = React.lazy(() => import('../admin-app/pages/add-matches/matches'))
const SeriesPage = React.lazy(() => import('../admin-app/pages/add-matches/series'))
const SportsPage = React.lazy(() => import('../admin-app/pages/add-matches/sports'))
const AddUser = React.lazy(() => import('../admin-app/pages/add-user/add-user'))
const ListClients = React.lazy(() => import('../admin-app/pages/list-clients/list-clients'))
const MainAdmin = React.lazy(() => import('../admin-app/pages/_layout/MainAdmin'))
const Message = React.lazy(() => import('../admin-app/pages/settings/message'))
const Paymethod = React.lazy(() => import('../admin-app/pages/settings/paymethod'))

const ClientLedger = React.lazy(() => import('./pages/ledger/ClientLedger'))
const MyLedger = React.lazy(() => import('./pages/ledger/MyLedger'))
const Notice = React.lazy(() => import('./pages/settings/Notices'))
const ManageOdds = React.lazy(() => import('./pages/settings/ManageOdds'))
const DeletedAllBets = React.lazy(() => import('./pages/UnsetteleBetHistory/DeletedBets'))






const AdminDashboard = React.lazy(
  () => import('../admin-app/pages/admin-dashboard/admin-dashboard'),
)
const AccountStatementAdmin = React.lazy(
  () => import('../admin-app/pages/AccountStatement/AccountStatementAdmin'),
)

const AccountStatementAdminDeposit = React.lazy(
  () => import('../admin-app/pages/AccountStatement/AccountStatementAdminDeposit'),
)

const OperationAdmin = React.lazy(
  () => import("../admin-app/pages/AccountStatement/Operation")
)
const DepositStatementAdmin = React.lazy(
  () => import('../admin-app/pages/transaction-statement/DepositStatementAdmin'),
)
const WithdrawStatementAdmin = React.lazy(
  () => import('../admin-app/pages/transaction-statement/WithdrawStatementAdmin'))
const ProfitLossAdmin = React.lazy(() => import('../admin-app/pages/PlReport/ProfitLossAdmin'))
const UnsetteleBetHistoryAdmin = React.lazy(
  () => import('../admin-app/pages/UnsetteleBetHistory/UnsetteleBetHistoryAdmin'),
)
const Odds = React.lazy(() => import('../pages/odds/odds'))
const ChangePassword = React.lazy(() => import('../pages/ChangePassword/ChangePassword'))
const AuthLayout = React.lazy(() => import('../pages/_layout/AuthLayout'))
const Login = React.lazy(() => import('./pages/login/login'))
const CasinoWrapper = React.lazy(() => import('../pages/CasinoList/CasinoWrapper'))
const CasinoList = React.lazy(() => import('./pages/casino-list/casino-list'))
const GameReportAdmin = React.lazy(() => import('./pages/GameReports/GameReportAdmin'))


const AdminRoutes = () => {
  const userState = useAppSelector<{ user: User }>(selectUserData)

  return [
    {
      path: '/admin',
      element: <AuthLayout />,
      children: [
        { path: 'login', element: <Login /> },
        {
          path: '/admin',
          element: <MainAdmin />,
          children: [
            { index: true, element: <ListClients /> },
            { path: 'dashbaord', element: <AdminDashboard /> },
            { path: 'market-analysis', element: <AdminDashboard /> },
            { path: 'odds/:matchId', element: <Odds /> },
            { path: 'odds/:matchId/:share', element: <Odds /> },

            ...['list-clients/:username', 'list-clients/:username/:type'].map((path) => ({
              key: 'list-client',
              path: path,
              element: <ListClients />,
            })),
            ...['add-user', 'add-user/:username','add-user/:username/:type','add-user/:type'].map((path) => ({
              key: 'add-user',
              path: path,
              element: <AddUser />,
            })),
            ...(userState.user.role === RoleType.admin || userState.user.role === RoleType.sadmin
              ? [
                { path: 'sports-list/:url?', element: <SportsPage /> },
                { path: 'series/:sportId', element: <SeriesPage /> },
                { path: 'matches/:sportId', element: <MatchesPage /> },
                { path: 'active-matches/:sportId/:matchType?', element: <ActiveMatches /> },
                { path: 'active-markets/:matchId', element: <ActiveMarkets /> },
                { path: 'active-fancies/:matchId', element: <GetAllFancy /> },
                { path: 'messages', element: <Message /> },
              ]
              : []),
            { path: 'change-password', element: <ChangePassword /> },
            { path: 'accountstatement/:name', element: <AccountStatementAdmin /> },
            { path: 'accountstatement-deposit/:name', element: <AccountStatementAdminDeposit /> },

            { path: 'operation/:uname', element: <OperationAdmin /> },

            { path: 'profitloss', element: <ProfitLossAdmin /> },
            { path: 'unsettledbet', element: <UnsetteleBetHistoryAdmin /> },
            { path: 'unsettledbet/:type', element: <UnsetteleBetHistoryAdmin /> },
            { path: 'deleted-bets', element: <DeletedAllBets /> },

            { path: 'casino/:gameCode', element: <CasinoWrapper /> },
            { path: 'casino-list', element: <CasinoList /> },
            { path: 'game-reports', element: <GameReportAdmin /> },
            { path: 'depositstatement', element: <DepositStatementAdmin /> },
            { path: 'withdrawstatement', element: <WithdrawStatementAdmin /> },
            { path: 'payment-method', element: <Paymethod /> },
            { path: "ledger-home", element: <LedgerHome/>},
            { path: "notice", element: <Notice/>},
            { path: "manage-odds", element: <ManageOdds />},

            { path: "session-bets/:id", element: <Completedbets/>},
            { path: "match-bets/:id", element: <RejectedBets />},
            { path: "report-bets/:id", element: <ReportBets />},
            { path: "client-bets/:id", element: <ClientBetsLedger />},


           



            {path:"all-settlement", element: <AllClientLedger/>},
            {path:"all-settlement/:pid", element: <SingleLedger />},

            {path:"ledger-client", element: <ClientLedger/>},
            {path:"total-profit", element: <TotalProfit/>},
            {path:"commision-len-den", element: <CommisionLenden />},
            {path: "all-client-report", element: <AllReport/>},
            {path:"casino-pl", element:<CasinoPL/>},
            {path: "sports-details", element: <SportsDetails/>},
            {path: "casino-details", element: <CasinoDetail/>},

            {path: "inplay-games", element: <Inplaygames/>},
            {path:"user-ac", element: <AdminUseras/>},






           

            


            {path:"my-ledger", element: <MyLedger/>}

            


          ],
        },
      ],
    },
  ]
}

export default AdminRoutes
