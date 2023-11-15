use aws_config::meta::region::RegionProviderChain;
use aws_lambda_events::event::sqs::{SqsEvent, SqsMessage};
use aws_sdk_dynamodb::Client;
use lambda_runtime::{run, service_fn, Error, LambdaEvent};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
struct Response {
    tables: Vec<String>,
    records: Vec<SqsMessage>
}

async fn function_handler(event: LambdaEvent<SqsEvent>) -> Result<Response, Error> {
    let region_provider = RegionProviderChain::default_provider().or_else("us-east-1");
    let config = aws_config::from_env().region(region_provider).load().await;
    let client = Client::new(&config);
    let tables = client.list_tables().send().await?;
    let table_names = tables.table_names();
    let mut output = Response {
        records: event.payload.records,
        tables: Vec::new()
    };
    for table_name in table_names {
        output.tables.push(table_name.to_string());
    }
    println!("{}", serde_json::to_string(&output).unwrap());
    Ok(output)
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_target(false)
        .without_time()
        .init();
    run(service_fn(function_handler)).await
}
