import React from 'react';
import Button from '@material-ui/core/Button';

class Option extends React.Component {
    constructor(props){
        super(props);
        this.state = {}
    }
    componentWillMount() {}
    componentWillUnmount() {}
    render(){
        return (
            <Button>授权</Button>
        );
    }
}

export default Option;
