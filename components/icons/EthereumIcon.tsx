import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

interface EthereumIconProps {
  size?: number;
  color?: string;
}

export const EthereumIcon: React.FC<EthereumIconProps> = ({ size = 24, color }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 320 533" fill="none">
      <G>
        <Path
          d="M159.6 402.5L319.6 302L159.6 533.3V402.5ZM183.4 415.6V457.4L234.7 383.4L183.4 415.6Z"
          fill={color || "#5A9DED"}
        />
        <Path
          d="M175.9 193.8L294.1 260.7L282.4 281.3L164.2 214.4L175.9 193.8Z"
          fill={color || "#D895D3"}
        />
        <Path
          d="M159.6 0L319.2 274.6L159.6 375.3V0ZM183.1 87.9V332.6L287.3 266.9L183.1 87.9Z"
          fill={color || "#FF9C92"}
        />
        <Path
          d="M160.1 402.5L0 302L160.1 533.3V402.5ZM136.3 415.6V457.4L85 383.4L136.3 415.6Z"
          fill={color || "#53D3E0"}
        />
        <Path
          d="M138.7 196L20.5 262.9L32.2 283.5L150.4 216.6L138.7 196Z"
          fill={color || "#A6E275"}
        />
        <Path
          d="M159.6 0L0 274.6L159.6 375.2V0ZM136 87.9V332.6L31.8 266.9L136 87.9Z"
          fill={color || "#FFE94D"}
        />
      </G>
    </Svg>
  );
};
