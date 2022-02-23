import { Button, Input, Space } from 'antd'
import { AppState } from 'app/model'
import { createKeyPair, decryptKeyPair } from 'app/model/key.controller'
import { Fragment, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

export type HeaderProps = {
  chat: boolean
  setChat: (value: boolean) => void
  stopChat: () => void
  startChat: () => void
  setPassword: (e: any) => void
  password: string
}

const HeaderChat = ({
  chat,
  setChat,
  stopChat,
  startChat,
  setPassword,
  password,
}: HeaderProps) => {
  const dispatch = useDispatch()
  const { keyPair } = useSelector((state: AppState) => state.key)

  const signUpToChat = useCallback(async () => {
    if (!password)
      return window.notify({
        type: 'error',
        description: 'Please enter password',
      })
    await dispatch(createKeyPair({ password }))
    await dispatch(decryptKeyPair({ password }))
    return setChat(true)
  }, [dispatch, password, setChat])

  return (
    <Fragment>
      {chat ? (
        <Button onClick={stopChat}>Stop Conversation</Button>
      ) : (
        <Space size={20}>
          <Input
            type="password"
            placeholder="enter password"
            onChange={(e: any) => setPassword(e.target.value)}
          />
          {!keyPair ? (
            <Button onClick={signUpToChat}>Sign up</Button>
          ) : (
            <Button onClick={startChat}>Start chat</Button>
          )}
        </Space>
      )}
    </Fragment>
  )
}

export default HeaderChat
