import React, { Suspense } from 'react'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import { WebSocketProvider } from './context/webSocket'
import App from './App'

import reportWebVitals from './reportWebVitals'
import { WebSocketUserProvider } from './context/webSocketUser'
import { WebSocketCasinoProvider } from './context/webSocketCasino'
import { createRoot } from 'react-dom/client';
import { DrawerProvider } from './context/DrawerContext'

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <Suspense
      fallback={
        // <div className='suspense-loading' style={{color:"black" , display:"flex" , alignItems:"center" ,fontSize:"10px"}}>
        //   {/* <img src='/imgs/logo.png' width={200} /> Prevoius Loader */}
        //   {/* <img src='/imgs/loading.gif' width={200} />  */}
        //   Loading....

        // </div>

        <div
  className="suspense-loading"
  style={{
    color: "black",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh", // 👈 full viewport height
    fontSize: "40px",
    fontWeight: "500",
    backgroundColor: "#fff", // optional, for clarity
  }}
>
  Loading....
</div>

      }
    >
      <Provider store={store}>
            <DrawerProvider>
        
        <WebSocketProvider>
          <WebSocketUserProvider>
            <WebSocketCasinoProvider>
              <App />
            </WebSocketCasinoProvider>
          </WebSocketUserProvider>
        </WebSocketProvider>
        </DrawerProvider>
      </Provider>
    </Suspense>
  )

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  reportWebVitals()
}
// Create a roo