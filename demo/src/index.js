import React from 'react';

import './index.scss?scoped';

function App(props) {
  return (
    <div className='app'>
      <button>test</button>
      <img src={require('@/images/a.png')}></img>
      <div className="footer"></div>
    </div>
  )
}

export default App;
