﻿class NecroWSClient implements INecroClient {
    private url: string;
    private config: INecroClientConfig;
    private webSocket: WebSocket;

    constructor(url: string) {
        this.url = url;
    }

    public start = (config: INecroClientConfig): void => {
        this.config = config;
        this.webSocket = new WebSocket(this.url);
        this.webSocket.onopen = this.clientOnOpen;
        this.webSocket.onmessage = this.clientOnMessage;
    }

    private clientOnOpen = (): void => {
        console.log(`Connected to ${this.webSocket.url}`);
    }

    private clientOnMessage = (event: MessageEvent): void => {
        const message = JSON.parse(event.data);
        console.log(message);

        const type = message.$type as string;

        if (_.includes(type, "UpdatePositionEvent")) {
            const mapLocation = message as IMapLocation;
            this.config.eventHandler.onLocationUpdate(mapLocation);
        } else if (_.includes(type, "PokeStopListEvent")) {
            const forts = message.Forts.$values as IFort[];
            this.config.eventHandler.onPokeStopList(forts);
        } else if (_.includes(type, "FortUsedEvent")) {
            const fortUsed = message as IPokeStopUsed;
            this.config.eventHandler.onFortUsed(fortUsed);
        } else if (_.includes(type, "ProfileEvent")) {
            const profile = message.Profile as IProfile;
            profile.PlayerData.PokeCoin = this.getCurrency(message, "POKECOIN");
            profile.PlayerData.StarDust = this.getCurrency(message, "STARDUST");
            this.config.eventHandler.onProfile(profile);
        }
    }

    private getCurrency = (message: any, currencyName: string): number => {
        const currencies = message.Profile.PlayerData.Currencies.$values as any[];
        const currency = _.find(currencies, x => x.Name === currencyName);
        return currency.Amount;
    }
}