import React from 'react';
import ReactDOM from 'react-dom';

const element = <div className="content">
        <form> 
            test
        </form>

        <div className="ico">
            Test
        </div>
    </div>;

ReactDOM.render(element, document.querySelector('#root'));