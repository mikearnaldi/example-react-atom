import * as Context from "effect/Context"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Schedule from "effect/Schedule"
import * as Schema from "effect/Schema"
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient"
import * as HttpClient from "effect/unstable/http/HttpClient"
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest"
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse"

export class Todo extends Schema.Class<Todo>("Todo")({
  userId: Schema.Number,
  id: Schema.Number,
  title: Schema.String,
  completed: Schema.Boolean
}) {}

export class TodoApiError extends Data.TaggedError("TodoApiError")<{
  readonly message: string
  readonly cause: unknown
}> {}

export class TodoApi extends Context.Service<TodoApi, {
  readonly getTodos: (useBrokenEndpoint: boolean) => Effect.Effect<ReadonlyArray<Todo>, TodoApiError>
}>()("example-react/TodoApi") {
  static readonly layer = Layer.effect(
    TodoApi,
    Effect.gen(function*() {
      const client = (yield* HttpClient.HttpClient).pipe(
        HttpClient.mapRequest((request) =>
          request.pipe(
            HttpClientRequest.prependUrl("https://jsonplaceholder.typicode.com"),
            HttpClientRequest.acceptJson
          )
        ),
        HttpClient.filterStatusOk,
        HttpClient.retryTransient({
          schedule: Schedule.exponential(100),
          times: 2
        })
      )

      const getTodos = Effect.fnUntraced(function*(useBrokenEndpoint: boolean) {
        const path = useBrokenEndpoint ? "/this-route-does-not-exist" : "/todos"
        return yield* client.get(path, {
          urlParams: useBrokenEndpoint ? {} : { _limit: 12 }
        }).pipe(
          Effect.flatMap(HttpClientResponse.schemaBodyJson(Schema.Array(Todo))),
          Effect.mapError((cause) =>
            new TodoApiError({
              message: useBrokenEndpoint
                ? "The demo requested a missing endpoint (404). The typed error stayed in Effect's error channel."
                : "The API request failed. Check the network connection and try again.",
              cause
            })
          )
        )
      })

      return TodoApi.of({ getTodos })
    })
  ).pipe(Layer.provide(FetchHttpClient.layer))
}
