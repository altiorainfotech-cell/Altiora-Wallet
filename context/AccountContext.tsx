import { StyleSheet, Text, View } from 'react-native'
import { createContext, ReactNode, useContext, } from 'react'
import React, { useState } from 'react'
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import CryptoJS from "crypto-js";
import { HDNodeWallet, Wallet, JsonRpcProvider, parseEther, ethers } from "ethers";

const BASE_URL = "https://api.0x.org/swap/v1";
interface WalletDetails {
    address: string,
    index: number | null
    name: string;
    chainId: string;
    rpcUrls: string[];
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number | null;
    };
    blockExplorerUrls: string[];
    icon?: any
}
type WalletStorageKey = "private_keys" | "SRP_wallet";
interface AccountcntxType {
    walletDetails: WalletDetails;
    setWalletDetails: React.Dispatch<React.SetStateAction<WalletDetails>>;
    walletWithProvider: HDNodeWallet | Wallet | null;
    error: string;
    setError: React.Dispatch<React.SetStateAction<string>>;

    // functions
    handleCreateEth: () => Promise<string[]>;
    handleImportPrivateKeyEth: (private_key: string) => Promise<void>;
    handleAccountRetreival: (key: string) => Promise<void>;
    handleTransactionsEth: (_to: string, _value: string) => Promise<string>;

}
const Accountcntx = createContext<AccountcntxType | undefined>(undefined);

// const [derivedAccounts, setDerivedAccounts] = useState<(Wallet | HDNodeWallet)[]>([]);

export const AccountContext = ({ children }: { children: ReactNode }) => {


    const [walletDetails, setWalletDetails] = useState<WalletDetails>({
        address: "", // account address
        index: null, // account number 
        name: "", // connected blockchain name
        chainId: "", // chain id
        rpcUrls: [],
        nativeCurrency: {
            name: "",
            symbol: "",
            decimals: null, // for conversion 
        },
        blockExplorerUrls: [],

    });

    // want sepreation in private keys imported account
    const [privateKeyAccount, setPrivateKeyAccount] = useState<(HDNodeWallet | Wallet)[]>([]);
    // want sepreation in imported account using Secrate phrase imported account
    const [derivedAccounts, setDerivedAccounts] = useState<(Wallet | HDNodeWallet)[]>([]);

    const [walletWithProvider, setWalletWithProvider] = useState<HDNodeWallet | Wallet | null>(null);
    const [error, setError] = useState("")

    const ALCHEMY_API_KEY = process.env.EXPO_PUBLIC_ALCHEMY_API_KEY;


    const handleSetAuthentication = async (): Promise<boolean> => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            if (!hasHardware) {
                setError("Biometric authentication is not available on this device");
            }
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            if (!isEnrolled) {
                setError("No biometric credentials enrolled. Please set up Face ID or fingerprint in device settings.");
                return false;

            }

            const auth = await LocalAuthentication.authenticateAsync();
            if (auth.success) {
                setError("");
                return true;
            } else {

                switch (auth.error) {
                    case 'unknown':
                        setError("An unknown error occurred");
                        break;
                    case 'user_cancel':
                        setError("Authentication was cancelled");
                        break;
                    case 'user_fallback':
                        setError("User chose fallback authentication");
                        break;
                    case 'system_cancel':
                        setError("Authentication was cancelled by system");
                        break;
                    case 'passcode_not_set':
                        setError("Passcode is not set on this device");
                        break;
                    case 'not_available':
                        setError("Biometric authentication is not available");
                        break;
                    case 'not_enrolled':
                        setError("No biometric credentials enrolled");
                        break;
                    case 'lockout':
                        setError("Too many failed attempts. Please try again later");
                        break;
                    default:
                        setError(`Authentication failed: ${auth.error}`);
                }
                return false;
            }
        } catch (error) {
            console.log("handleSetAuthentication error", error);
            setError("An error occurred during authentication");
            return false;

        }
    }



    // handleSecureStore
    const handleSecureStore = async (key_for_wallet_type: string, value: HDNodeWallet | Wallet) => {
        try {
            const isAuthenticated = await handleAuthentication("Authenticate to save wallet");
            if (!isAuthenticated) {
                return false;
            }
            const checkAvailability = await SecureStore.isAvailableAsync();


            if (!checkAvailability) {
                setError("Your device doesn't support the secure store ");
            }
            const canBio = SecureStore.canUseBiometricAuthentication();
            const options: SecureStore.SecureStoreOptions = ({
                authenticationPrompt: "Authenticate to save wallet data",
                keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
                requireAuthentication: canBio,
            })
            let aesKey = await SecureStore.getItemAsync("aes_Key");
            if (!aesKey) {
                aesKey = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
                await SecureStore.setItemAsync("aes_Key", aesKey, options);
            }

            const encryptedWallet = await value.encrypt(aesKey);

            const storedData = await SecureStore.getItemAsync(key_for_wallet_type);
            const walletsArray: string[] = storedData ? JSON.parse(storedData) : [];

            walletsArray.push(encryptedWallet);


            await SecureStore.setItemAsync(
                key_for_wallet_type,
                JSON.stringify(walletsArray),
                options
            );

        } catch (error) {
            console.error("handleSecureStore error:", error);
            setError("Failed to securely store your data");
        }
    }

    const handleAccountRetreival = async () => {
        try {
            const isAuthenticated = await handleAuthentication("Unlock Wallet")
            if (!isAuthenticated) {
                setError("Authentication required");
                return;
            }
            // const aesKey = await SecureStore.getItemAsync("aes_Key");
            const aesKey = await SecureStore.getItemAsync("aes_Key");
            if (!aesKey) {
                setError("No AES key found. Cannot decrypt wallets.");
                return;
            }

            const provider = new JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);
            const privateKeysData = await SecureStore.getItemAsync("private_keys");
            const privateWalletsJson: string[] = privateKeysData ? JSON.parse(privateKeysData) : [];
            if (privateWalletsJson.length > 0) {
                const WalletsWithoutProvider = await Promise.all(
                    privateWalletsJson.map(async (json) => await Wallet.fromEncryptedJson(json, aesKey)));
                const WalletsWithProvider = WalletsWithoutProvider.map((w) => w.connect(provider));

                setPrivateKeyAccount(WalletsWithoutProvider);

                if (WalletsWithProvider.length > 0) {
                    setWalletWithProvider(WalletsWithProvider[0]);
                    const network = await provider.getNetwork();
                    // setWalletWithProvider(walletWithProvider);
                    setWalletDetails({
                        address: WalletsWithProvider[0].address,
                        index: WalletsWithProvider[0] instanceof HDNodeWallet ? WalletsWithProvider[0].index : 0,
                        name: network.name || "Unknown Network",
                        chainId: network.chainId.toString(),
                        rpcUrls: [`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`],
                        nativeCurrency: {
                            name: "Ether",
                            symbol: "ETH",
                            decimals: 18,
                        },
                        blockExplorerUrls: ["https://sepolia.etherscan.io"]
                    });
                }
            }
            const srpData = await SecureStore.getItemAsync("SRP_wallet");
            const srpWalletsJson: string[] = srpData ? JSON.parse(srpData) : [];
            if (srpWalletsJson.length > 0) {
                const WalletsWithoutProvider = await Promise.all(
                    srpWalletsJson.map(async (json) => await Wallet.fromEncryptedJson(json, aesKey)));
                const WalletsWithProvider = WalletsWithoutProvider.map((w) => w.connect(provider));

                setDerivedAccounts(WalletsWithoutProvider);
                if (WalletsWithProvider.length > 0) {
                    setWalletWithProvider(WalletsWithProvider[0]);
                    const network = await provider.getNetwork();
                    if (walletWithProvider)
                        // setWalletWithProvider(walletWithProvider);
                        setWalletDetails({
                            address: WalletsWithProvider[0].address,
                            index: WalletsWithProvider[0] instanceof HDNodeWallet ? WalletsWithProvider[0].index : 0,
                            name: network.name || "Unknown Network",
                            chainId: network.chainId.toString(),
                            rpcUrls: [`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`],
                            nativeCurrency: {
                                name: "Ether",
                                symbol: "ETH",
                                decimals: 18,
                            },
                            blockExplorerUrls: ["https://sepolia.etherscan.io"]
                        });
                }
            }
            if (privateWalletsJson.length === 0 && srpWalletsJson.length === 0) {
                setError("No wallets found in secure store");
            }
        } catch (error) {
            console.error("handleRetrieval error:", error);
            setError("Error retrieving data from secure store");
        }
    }
    const handleCheckBiometricAvailability = async (): Promise<{
        available: boolean;
        enrolled: boolean;
        types: LocalAuthentication.AuthenticationType[];
    }> => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

            return {
                available: hasHardware,
                enrolled: isEnrolled,
                types: supportedTypes
            };
        } catch (error) {
            console.error("handleCheckBiometricAvailability error:", error);
            return {
                available: false,
                enrolled: false,
                types: []
            };
        }
    };

    const handleAuthentication = async (message: string): Promise<boolean> => {

        try {
            const { available, enrolled } = await handleCheckBiometricAvailability();
            if (!available) {
                setError("Biometric authentication is not available on this device");
                return false;
            }

            if (!enrolled) {
                setError("Please set up biometric authentication in your device settings");
                return false;
            }
            const auth = await LocalAuthentication.authenticateAsync({
                promptMessage: message,
                cancelLabel: "Cancel",
                disableDeviceFallback: false
            });
            if (auth.success) {
                setError("");
                return true;
            } else {
                const errorMessages: Record<string, string> = {
                    'unknown': "An unknown error occurred",
                    'user_cancel': "Authentication was cancelled",
                    'user_fallback': "User chose fallback authentication",
                    'system_cancel': "Authentication was cancelled by system",
                    'passcode_not_set': "Passcode is not set on this device",
                    'not_available': "Biometric authentication is not available",
                    'not_enrolled': "No biometric credentials enrolled",
                    'lockout': "Too many failed attempts. Please try again later",
                };
                setError(errorMessages[auth.error || 'unknown'] || `Authentication failed: ${auth.error}`);
                return false;
            }
        } catch (error) {
            console.error("handleAuthentication error:", error);
            setError("An error occurred during authentication");
            return false;
        }
    }




    const handleImportPrivateKeyEth = async (private_key: string) => {
        try {
            const importWallet = new Wallet(private_key);
            const provider = new JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);
            const walletWithProvider = importWallet.connect(provider);
            setWalletWithProvider(walletWithProvider)
            console.log("Imported wallet using private key:", walletWithProvider, walletDetails.address);
            const network = await provider.getNetwork();
            // setWalletWithProvider(walletWithProvider);
            setWalletDetails({
                address: walletWithProvider.address,
                index: walletWithProvider instanceof HDNodeWallet ? walletWithProvider.index : 0,
                name: network.name || "Unknown Network",
                chainId: network.chainId.toString(),
                rpcUrls: [`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`],
                nativeCurrency: {
                    name: "Ether",
                    symbol: "ETH",
                    decimals: 18,
                },
                blockExplorerUrls: ["https://sepolia.etherscan.io"]
            });
            setPrivateKeyAccount((prev) =>
                [...prev,
                    importWallet]);
            await handleSecureStore("private_keys", importWallet);
            console.log("Imported wallet using private key:", walletWithProvider.address);

            // store wallet in the moblie check before storing that if the use is right now on boarding the or already using the wallet and now importing the private key

        } catch (error) {
            console.log("Error importing private key:", error);
            setError("Failed to import private key");
        }
    }


    const handleCreateEth = async () => {
        try {


            const wallet = HDNodeWallet.createRandom();
            const provider = new JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);
            const walletWithProvider = wallet.connect(provider);
            const network = await provider.getNetwork();
            setWalletWithProvider(walletWithProvider);
            setWalletDetails({
                address: walletWithProvider.address,
                index: walletWithProvider.index,
                name: network.name || "Unknown Network",
                chainId: network.chainId.toString(),
                rpcUrls: [`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`],
                nativeCurrency: {
                    name: "Ether",
                    symbol: "ETH",
                    decimals: 18,
                },
                blockExplorerUrls: ["https://sepolia.etherscan.io"]
            });
            const handlesecureStore = await handleSecureStore("SRP_wallet", wallet);
            // LocalAuthentication.authenticateAsync
            if (wallet.mnemonic?.phrase) {
                return wallet.mnemonic.phrase.split(" ");

            }
            return [];
        } catch (error) {
            console.error("Error creating Ethereum account:", error);
            return [];
        }
    }


    const handleTransactionsEth = async (_to: string, _value: string): Promise<string> => {
        try {
            handleAuthentication("Authentication Required for Transactions");
            if (!walletWithProvider?.provider || !walletWithProvider) {
                throw new Error("Wallet not connected");
            }

            if (!ethers.isAddress(_to)) throw new Error("Invalid recipient address");

            const nonce = await walletWithProvider.provider.getTransactionCount(walletWithProvider.address);
            const feeData = await walletWithProvider.provider.getFeeData();
            const _chainId = (await walletWithProvider.provider.getNetwork()).chainId;

            if (!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas)
                throw new Error("Unable to fetch gas fees");

            const tx = {
                to: _to,
                value: parseEther(_value),
                nonce,
                gasLimit: 21000,
                maxFeePerGas: feeData.maxFeePerGas,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
                chainId: _chainId,
            };

            console.log("Signing transaction...");
            const signedTx = await walletWithProvider.signTransaction(tx);
            console.log("Broadcasting transaction...");
            const txResponse = await walletWithProvider.provider.broadcastTransaction(signedTx);
            console.log("Transaction hash:", txResponse.hash);

            const receipt = await txResponse.wait();
            if (!receipt) throw new Error("Transaction receipt not found");

            console.log("Transaction confirmed in block:", receipt.blockNumber);
            if (receipt.status === 0) throw new Error("Transaction failed on blockchain");

            return txResponse.hash;
        } catch (error: any) {
            console.error("Transaction error:", error);
            throw new Error(error.message || "Transaction failed");
        }
    };



    // const handleAddNewAccountEth

    return (
        <Accountcntx.Provider value={{
            walletDetails,
            setWalletDetails,
            walletWithProvider,
            error,
            setError,
            handleCreateEth,
            handleImportPrivateKeyEth,
            handleAccountRetreival,
            handleTransactionsEth,
        }}>
            {children}
        </Accountcntx.Provider>
    )
}

export const useAccountcntx = (): AccountcntxType => {
    const context = useContext(Accountcntx);
    if (!context) {
        throw new Error("useAccount must be used within an AccountProvider");

    }
    return context;
}

const styles = StyleSheet.create({})