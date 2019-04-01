import React from 'react';
import request from '../../common/request';

class OAuth extends React.Component {
    constructor(props){
        super(props);
        this.state = {

        }
    }
    componentWillMount() {
        request.get()
    }
  
    componentWillUnmount() {
        
    }
    render(){
        return (
            <div>23333</div>
        );
    }

}