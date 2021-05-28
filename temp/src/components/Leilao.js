import React, { Component } from 'react';
import { Button, Input, Table } from 'semantic-ui-react'
import { createContract } from './../ethereum/leilaoContract'
import { web3 } from './../ethereum/web3'

export class Leilao extends Component {

  ONGOING_STATE = '0'
  FAILED_STATE = '1'
  SUCCEEDED_STATE = '2'
  PAID_OUT_STATE = '3'

  state = {
    campaign: {
      name: 'N/A',
      targetAmount: 0,
      totalCollected: 0,
      campaignFinished: false,
      deadline: new Date(0),
      isBeneficiary: false,
      state: ''
    },
    contributionAmount: '0'
  }

  constructor(props) {
    super(props)

    this.onContribute = this.onContribute.bind(this)
  }

  async componentDidMount() {
    const currentCampaign = await this.getCampaign(this.getCampaignAddress())
    this.setState({
      campaign: currentCampaign
    })
  }

  getCampaignAddress() {
    return this.props.match.params.address
  }

  async getCampaign(address) {
    const contract = createContract(address)

    // Coleta os dados da Blockchain
    const name = await contract.methods.name().call()
    const targetAmount = await contract.methods.targetAmount().call()
    const totalCollected = await contract.methods.totalCollected().call()
    const beforeDeadline = await contract.methods.beforeDeadline().call()
    const beneficiary = await contract.methods.beneficiary().call()
    const deadlineSeconds = await contract.methods.fundingDeadline().call()
    const state = await contract.methods.state().call()

    var deadlineDate = new Date(0);
    deadlineDate.setUTCSeconds(deadlineSeconds)

    const accounts = await web3.eth.getAccounts(console.log)

    console.log(accounts)
    
    // Retorna os dados da Blockchain
    return {
      name: name,
      targetAmount: targetAmount,
      totalCollected: totalCollected,
      campaignFinished: !beforeDeadline,
      deadline: deadlineDate,
      isBeneficiary: beneficiary.toLowerCase() === accounts[0].toLowerCase(),
      state: state
    }
  }

  // Monta a tabela com os dados do contrato
  render() {
    return (
      <div>
        <Table celled padded color="teal" striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Nome</Table.HeaderCell>
              <Table.HeaderCell>Valor</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>

            <Table.Row>
              <Table.Cell singleLine>
                Título do Leilão
              </Table.Cell>
              <Table.Cell singleLine>
                {this.state.campaign.name}
              </Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell singleLine>
                Total Objetivo
              </Table.Cell>
              <Table.Cell singleLine>
                {this.state.campaign.targetAmount}
              </Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell singleLine>
                Total Arrecadado
              </Table.Cell>
              <Table.Cell singleLine>
                {this.state.campaign.totalCollected}
              </Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell singleLine>
                Leilão Encerrado
              </Table.Cell>
              <Table.Cell singleLine>
                {this.state.campaign.campaignFinished.toString()}
              </Table.Cell>
            </Table.Row>


            <Table.Row>
              <Table.Cell singleLine>
                Data de Término do Leilão
              </Table.Cell>
              <Table.Cell singleLine>
                {this.state.campaign.deadline.toString()}
              </Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell singleLine>
                Eu sou o Beneficiário
              </Table.Cell>
              <Table.Cell singleLine>
                {this.state.campaign.isBeneficiary.toString()}
              </Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell singleLine>
                Estado do Contrato
              </Table.Cell>
              <Table.Cell singleLine>
                {this.state.campaign.state}
              </Table.Cell>
            </Table.Row>

          </Table.Body>

          <Table.Footer fullWidth>
            <Table.Row>
              <Table.HeaderCell colSpan="2">
                {this.campaignInteractionSection()}
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>

      </div>
    );
  }

  campaignInteractionSection() {
    if (this.state.campaign.campaignFinished) {
      return this.postCampaignInterface()
    } else {
      return this.contributeInterface()
    }
  }

  postCampaignInterface() {
    if (this.state.campaign.state === this.ONGOING_STATE) {
      return <div>
        <Button type='submit' positive>Finalizar Leilão</Button>
      </div>
    }
    if (this.state.campaign.state === this.SUCCEEDED_STATE
      && this.state.campaign.isBeneficiary === true) {

      return <div>
        <Button type='submit' negative>Coletar Valor Arrecadado</Button>
      </div>
    }

    if (this.state.campaign.state === this.FAILED_STATE) {
      return <div>
        <Button type='submit' negative>Reembolso</Button>
      </div>
    }
  }

  contributeInterface() {
    return <div>
      <Input
        action={{
          color: 'teal',
          content: 'Dar Um Lance',
          onClick: this.onContribute
        }}
        actionPosition='left'
        label='Valor do Lance em ETH'
        labelPosition='right'
        placeholder='1'
        onChange={(e) => this.setState({contributionAmount: e.target.value})}
      />
    </div>
  }

  async onContribute(event) {
    const accounts = await web3.eth.getAccounts()
    const amount = web3.utils.toWei(
      this.state.contributionAmount,
      'ether'
    )
    const contract = createContract(this.getCampaignAddress())
    await contract.methods.contribute().send({
      from: accounts[0],
      value: amount
    })

    const campaign = this.state.campaign
    campaign.totalCollected = Number.parseInt(campaign.totalCollected) +  Number.parseInt(amount)

    this.setState({ campaign: campaign })
  }

}