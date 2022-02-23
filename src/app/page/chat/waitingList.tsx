import { useWallet } from '@senhub/providers'
import { Button, Card, Col, Row, Space, Typography } from 'antd'
import { db, TOPIC } from 'app/constants'
import { AppState } from 'app/model'
import {
  clearMessages,
  clearRequest,
  RequestChat,
} from 'app/model/chat.controller'
import { setTopic } from 'app/model/topic.controller'
import { useDispatch, useSelector } from 'react-redux'
import { shortenAddress } from 'shared/util'

const WaitingList = ({
  setReceiver,
  setReceiverPK,
}: {
  setReceiver: (value: string) => void
  setReceiverPK: (value: string) => void
}) => {
  const {
    topic: { topic },
    chat: { requestChats },
    key: {
      keyPairDecrypted: { myPublicKey },
    },
  } = useSelector((state: AppState) => state)
  const {
    wallet: { address: walletAddress },
  } = useWallet()
  const dispatch = useDispatch()

  const acceptChat = async (requestChat: RequestChat) => {
    const { owner, publicKey } = requestChat
    const receiverTopic = owner
    const id = new Date().toISOString()
    const message = db
      .get('messages')
      .set({ publicKey: myPublicKey, owner: walletAddress, sendTo: owner })
    await db.get(topic).get(id).put(message)

    /**Send data to receiver topic for get history*/
    await db.get(receiverTopic).get(id).put({
      publicKey: myPublicKey,
      owner: walletAddress,
      sendTo: owner,
      rely: true,
    })
    dispatch(setTopic({ topic: TOPIC }))
    setReceiver(owner)
    setReceiverPK(publicKey)
    dispatch(clearRequest({ requestChat }))
    return dispatch(clearMessages())
  }

  const rejectChat = () => {
    setReceiverPK('')
    setReceiver('')
  }

  return (
    <Card
      style={{
        height: 'calc(100vh - 350px)',
        overflow: 'auto',
        background: '#f1f9f9',
        boxShadow: 'unset',
      }}
      bordered={false}
    >
      <Row gutter={[12, 12]} justify="center">
        {requestChats.map((request) => (
          <Col span={20} key={request.owner}>
            <Card
              bordered={false}
              style={{
                boxShadow: '0 0 15px #dadada',
                borderRadius: 12,
                backgroundColor: '#ffff',
              }}
              bodyStyle={{ padding: '8px 12px' }}
            >
              <Row align="middle">
                <Col flex="auto">
                  <Space direction="vertical" size={0}>
                    <Space>
                      {/* {avatar(mess.owner)} */}
                      <Typography.Text>
                        User {shortenAddress(request.owner)}
                      </Typography.Text>
                    </Space>
                    <Typography.Text type="secondary">
                      <Space>
                        <Typography.Text
                          type="secondary"
                          style={{ fontSize: 12 }}
                        >
                          Message:
                        </Typography.Text>
                        <Typography.Text
                          type="secondary"
                          style={{ fontSize: 12 }}
                        >
                          {request.message}
                        </Typography.Text>
                      </Space>
                    </Typography.Text>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Button onClick={() => acceptChat(request)} type="primary">
                      Accept
                    </Button>
                    <Button onClick={rejectChat}>Reject</Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  )
}

export default WaitingList
