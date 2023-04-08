import { StackProps } from "aws-cdk-lib";

export interface KrakenStackProps extends StackProps {
    componentId: string;
}