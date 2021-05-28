import React, { Component } from 'react';
import { Button, Header, Form } from 'semantic-ui-react'
import { withRouter } from 'react-router';

export class Home extends Component {

  state = {
    address: '0xD89Bf8b2cAd5CC9db88316F4635DDc6c2F5751C3'
  }

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  render() {
    return (
      <div>
        <Header as='h1'>Descentralized application for Auction</Header>

        <Form>
          <Form.Input
            label='Address Contract'
            type='text'
            value={this.state.address}
            onChange={this.onChange}
          />
          <Button
            type='submit'
            onClick={this.onSubmit}
          >
            Enter Auction
          </Button>
        </Form>
      </div>
    );
  }

  onChange(event) {
    this.setState({address: event.target.value});
  }

  onSubmit(event) {
    event.preventDefault();
    this.props.history.push(`/campaigns/${this.state.address}`)
  }
}

export default withRouter(Home);
