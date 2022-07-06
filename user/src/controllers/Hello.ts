import * as grpc from "@grpc/grpc-js"
import {SayHelloService, ISayHelloService} from "../proto/hello/hello_grpc_pb"
import {HelloRequest, HelloResponse} from "../proto/hello/hello_pb"

class HelloHandler implements ISayHelloService{
    
    sayHello = (call: grpc.ServerUnaryCall<HelloRequest, HelloResponse>, callback: grpc.sendUnaryData<HelloResponse>): void => {
        const reply: HelloResponse = new HelloResponse();
        reply.setMessage(`Hello, ${ call.request.getName() }`);
        callback(null, reply); 
    }
}
