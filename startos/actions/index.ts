import { sdk } from '../sdk'
import { mqttCredentials } from './mqttCredentials'
import { resetMqttPassword } from './resetMqttPassword'

export const actions = sdk.Actions.of()
  .addAction(mqttCredentials)
  .addAction(resetMqttPassword)
