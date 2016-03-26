import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

class WebSocketMan extends React.Component {
    constructor() {
        super();
        this.state = { indicators: [] };
    }

    componentDidMount() {
        this.socket = new WebSocket('ws://' + location.host + '/indicators');

        this.socket.onmessage = e => {
            const data = JSON.parse(e.data);
            console.log(data);
            this.setState(data);
        }
    }

    render() {
        return <IndicatorBar indicators={this.state.indicators} />;
    }
}

class IndicatorBar extends React.Component {
    render() {
        return <div className='indicator-bar'>{
            this.props.indicators.map(i => {
                return <Indicator key={i.id} style={i.style} />;
            })
        }</div>;
    }
}

class Indicator extends React.Component {
    render() {
        const className = classNames({
            'indicator': true
        });

        const style = {
            backgroundImage: 'url(images/' + this.props.style + '@2x.png)'
        };

        return <div className={className} style={style}></div>;
    }
}

ReactDOM.render(
    <WebSocketMan />,
    document.getElementById('container')
);
