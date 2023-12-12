provider "aws" {
    profile = var.profile
    region = var.region
}

data "archive_file" "lambda_zip" {
    type = "zip"
    source_dir = "../src"
    output_path = "../tmp/lambda.zip"
}

resource "aws_s3_object" "lambda_fn" {
    bucket = var.bucket
    key = "terraform-template/lambda.zip"
    source = data.archive_file.lambda_zip.output_path
    etag = filemd5(data.archive_file.lambda_zip.output_path)
}

resource "aws_iam_role" "lambda_role" {
    name = "lambda_terraform-role"
    assume_role_policy = jsonencode({
        Version = "2012-10-17"
        Statement = [{
            Effect = "Allow"
            Principal = {
                Service = "lambda.amazonaws.com"
            }
            Action = "sts:AssumeRole"
        }]
    })
}

resource "aws_iam_policy" "lambda_policy_cloudwatch" {
    name = "cloudwatch"
    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Effect = "Allow",
                Action = [
                    "logs:CreateLogGroup"
                ]
                Resource = "*"
            },
            {
                Effect = "Allow",
                Action = [
                    "logs:CreateLogStream",
                    "logs:PutLogEvents",
                    "logs:DescribeLogStreams"
                ]
                Resource = "arn:aws:logs:*:*:log-group:*:*"
            }
        ]
    })
}

resource "aws_iam_policy" "lambda_policy_xray" {
    name = "xray"
    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Effect = "Allow",
                Action = [
                    "xray:PutTraceSegments",
                    "xray:PutTelemetryRecords",
                    "xray:GetSamplingRules",
                    "xray:GetSamplingTargets",
                    "xray:GetSamplingStatisticSummaries"
                ]
                Resource = "*"
            }
        ]
    })
}

resource "aws_iam_role_policy_attachment" "lambda_attach_cloudwatch" {
    role = aws_iam_role.lambda_role.name
    policy_arn = aws_iam_policy.lambda_policy_cloudwatch.arn
}

resource "aws_iam_role_policy_attachment" "lambda_attach_xray" {
    role = aws_iam_role.lambda_role.name
    policy_arn = aws_iam_policy.lambda_policy_cloudwatch.arn
}

resource "aws_lambda_function" "fn" {
    function_name = "lambda-terraform-fn"
    s3_bucket = var.bucket
    s3_key = aws_s3_object.lambda_fn.key
    runtime = "python3.11"
    handler = "fn.handler"
    source_code_hash = data.archive_file.lambda_zip.output_base64sha256
    role = aws_iam_role.lambda_role.arn
    environment {
        variables = {
            FOO = "bar"
        }
    }
    tags = {
        "application:group" = "templates"
        "application:subgroup" = "terraform"
        "application:owner" = "heeki"
    }
}

resource "aws_cloudwatch_log_group" "fn_log_group" {
    name = "/aws/lambda/${aws_lambda_function.fn.function_name}"
    retention_in_days = 7
}

output "function" {
    value = aws_lambda_function.fn.function_name
}