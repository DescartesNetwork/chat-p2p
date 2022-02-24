export const generateTopic = (myAddr: string, receiverAddr: string) => {
  let result = ''
  const characters = myAddr + receiverAddr
  const charactersLength = characters.length
  for (var i = 0; i < 15; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}
