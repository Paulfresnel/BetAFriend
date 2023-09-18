import { useEffect } from 'react';
import { ethers } from "ethers";
import { Button } from '@chakra-ui/react'
import { Link } from 'react-router-dom';
import {
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuItemOption,
    MenuGroup,
    MenuOptionGroup,
    MenuDivider,
  } from '@chakra-ui/react'


const provider = new ethers.getDefaultProvider(process.env.REACT_APP_ALCHEMY_URL);
console.log("provider", provider);



function WalletConnect(props){    

    const { userAccount, setUserAccount } = props;

    console.log("window", window.ethereum);

    /* useEffect(() => {
        -p
        let getSigner = async () =>{
        if (userAccount && !signer) {
          // Initialize the signer when userAccount is available
         let signer2 = await provider.getSigner(userAccount);
          console.log(signer2);
          setSigner(signer2);
          console.log(signer)
        }
    }
    getSigner();
      }, [userAccount, signer]); */

      useEffect(()=>{

        /* if (userAccount){
        let detectChain = async () =>{
            let chainId = await window.ethereum.request({method: "eth_chainId"});
            console.log("chainId", chainId);

            if (parseInt(chainId) !== 8001) {
                try {
                  await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: { chainId: "0x13881"}
                  });
                } catch (addError) {
                    console.log(addError);
                  // handle "add" error
                }
              }
        }
        detectChain(); */
    }, [])
    
      const connectWallet = async (e) => {
        console.log(userAccount)
        e.preventDefault();
        window.ethereum.enable()

        try {
          if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = await accounts[0];
            console.log(provider, accounts)
            setUserAccount(account);
          } else {
            console.error('No Ethereum wallet detected.');
          }
        } catch (error) {
          console.error('Error connecting to wallet:', error);
        }
      };

    return (
        <div>
                {userAccount ? <p> Welcome back {userAccount}</p> : <Button onClick={(e)=>connectWallet(e)}>connect</Button>}
                <Menu>
  <MenuButton as={Button} rightIcon=<i className="fa-solid fa-chevron-down"></i>>
    CodeX DAO
  </MenuButton>
  <MenuList>
  <Link to='/proposals'> <MenuItem>Proposals Dashboard </MenuItem></Link>
    {!userAccount && <MenuItem onClick={(e)=>connectWallet(e)}>Connect Wallet</MenuItem>}
    <MenuItem>My CodeX Profile</MenuItem>
    <Link to='/'><MenuItem>Home</MenuItem></Link>
    <MenuItem>Join the DAO</MenuItem>
  </MenuList>
</Menu>
        </div>
    )
}

export default WalletConnect