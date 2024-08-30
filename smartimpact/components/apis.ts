"use strict";
export async function vehicles(ownerAddress: string) {
    const url = "https://identity-api.dimo.zone/query";
    const myQuery = `
        {
            vehicles(first: 10, filterBy: {owner: "0xB8E514da5E7b2918AebC139ae7CbEFc3727f05D3"}) {
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