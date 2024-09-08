"use strict";
import Web3 from "web3"

export async function vehicles(ownerAddress: string) {
    const url = "https://identity-api.dimo.zone/query";
    // TODO: replace address with ${ownerAddress}
    const myQuery = `
        {
            vehicles(first: 10, filterBy: {owner: "0xf9D26323Ab49179A6d57C26515B01De018553787"}) { 
                nodes {
                    tokenId
                    owner
                    definition {
                        make
                        model
                        year
                    }
                }
            }
        }
    `;

    const myQuery2 = `
        {
            vehicles(first: 100, filterBy: {privileged: "0x7516c0358EbaBf58122c59D9068dEEc25332f946"}) { 
                nodes {
                    tokenId
                    owner
                    definition {
                        make
                        model
                        year
                    }
                }
            }
        }
    `;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: myQuery }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const response2 = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: myQuery2 }),
        });

        if (!response2.ok) {
            throw new Error(`HTTP error! status: ${response2.status}`);
        }
        const data2 = await response2.json();
        let priviledged = new Map<Number, Boolean>();
        let nopermission = []
        for (let i = 0; i < data2.data.vehicles.nodes.length; i++) {
            priviledged.set(data2.data.vehicles.nodes[i].tokenId, true)
        }

        for (let i = 0; i < data.data.vehicles.nodes.length; i++) {
            if (!priviledged.has(data.data.vehicles.nodes[i].tokenId)) {
                nopermission.push(data.data.vehicles.nodes[i])
            }
        }

        return nopermission;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}


export async function vehicleStats(vehicle: string) {
    const url = "https://identity-api.dimo.zone/query";
    const myQuery = `
        query GetDefinitionByDeviceId {
            deviceDefinition (by: { id: "${vehicle}"})  {
                year
                model
                attributes {
                    name
                    value
                }
            }
        }
    `;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: myQuery }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}


export async function userVehicle(ownerAddress: string) {
    const url = "https://identity-api.dimo.zone/query";
    // TODO: replace address with ${ownerAddress}
    const myQuery = `
        {
            vehicles(first: 10, filterBy: {privileged: "0x7516c0358EbaBf58122c59D9068dEEc25332f946", owner: "0xf9D26323Ab49179A6d57C26515B01De018553787"}) { 
                nodes {
                    tokenId
                    owner
                    definition {
                        make
                        model
                        year
                    }
                }
            }
        }
    `;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: myQuery }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export async function getAccessKeys(tokenId: string) {
    const url = "https://auth.dimo.zone/auth/web3/generate_challenge?client_id=0x7516c0358EbaBf58122c59D9068dEEc25332f946&domain=http://www.localhost:3000/&scope=openid email&response_type=code&address=0x7516c0358EbaBf58122c59D9068dEEc25332f946";
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const web3 = new Web3();
        const msg = data.challenge
        const privateKey = process.env.EXPO_PUBLIC_DIMO_PRIVATE_KEY
        const formattedKey = '0x' + Buffer.from(privateKey, 'utf8');

        const sign = web3.eth.accounts.sign(msg, formattedKey)
        const signature = sign.signature

        const submitURL = "https://auth.dimo.zone/auth/web3/submit_challenge";
        let param = {
            client_id: '0x7516c0358EbaBf58122c59D9068dEEc25332f946',
            state: data.state,
            grant_type: 'authorization_code',
            domain: "http://www.localhost:3000/",
            signature: signature
        };

        let body = new URLSearchParams(param).toString();

        const submit = await fetch(submitURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body,
        });
        let responseData = await submit.json();
        return responseData.access_token;

    } catch (error) {
        console.error('Error fetching access key data:', error);
        throw error;
    }
}

export async function getPriviledgeKeys(access_token: string, tokenId: number) {
    try {
        const token_exchange_url = "https://token-exchange-api.dimo.zone/v1/tokens/exchange"
        let param = {
            nftContractAddress: '0xbA5738a18d83D41847dfFbDC6101d37C69c9B0cF',
            privileges: [1, 3, 4, 6],
            tokenId: tokenId,
        };
        let body = new URLSearchParams(param).toString();

        const exchange = await fetch(token_exchange_url, {
            method: 'POST',
            headers: {
                "Authorization": "Bearer " + access_token,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body,
        });
        const responseData = await exchange.json();
        return responseData.token

    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export async function getTelemetry(priviledged: string, tokenId: number) {
    const url = "https://telemetry-api.dimo.zone/query"
    const myQuery = `
        query {
            signals(
                    tokenId: ${tokenId},
                    from: "2024-05-07T09:21:19Z", 
                    to: "2024-05-10T09:21:19Z",
                    interval: "24h" 
                )
            {
                currentLocationLatitude(agg: RAND)
                currentLocationLongitude(agg: RAND)
            }
        }
    `;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': "Bearer " + priviledged,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: myQuery }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.data.signals[0]
    } catch (error) {
        console.error('Error fetching telemetry:', error);
        throw error;
    }
}

export async function getLiveLocation(lat: number, long: number) {
    return {lat: lat, lng: long}
}