import { useDispatch, useSelector } from 'react-redux'

import { Col, Row } from 'antd'

import { setTopic } from 'app/model/topic.controller'
import { AppState } from 'app/model'
import { Conversation } from 'app/model/chat.controller'
import ConversationItem from './conversationItem'

const ListConversation = ({
  setReceiver,
  setReceiverPK,
}: {
  setReceiver: (value: string) => void
  setReceiverPK: (value: string) => void
}) => {
  const dispatch = useDispatch()
  const {
    chat: { conversations },
  } = useSelector((state: AppState) => state)

  const startToChat = (conversation: Conversation) => {
    const { address: receiverAddr, topic, publicKey: receiverPK } = conversation
    setReceiver(receiverAddr)
    setReceiverPK(receiverPK)
    return dispatch(setTopic({ topic }))
  }
  return (
    <Row gutter={[24, 24]}>
      {Object.values(conversations).map((conversation) => (
        <Col key={conversation.address}>
          <ConversationItem
            conversation={conversation}
            startToChat={startToChat}
          />
        </Col>
      ))}
    </Row>
  )
}

export default ListConversation
