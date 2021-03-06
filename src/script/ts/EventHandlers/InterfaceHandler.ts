﻿class InterfaceHandler implements IEventHandler {
    private config: IInterfaceHandlerConfig;
    private currentlySniping: boolean;
    private pokeStops: IPokeStopEvent[];
    private gyms: IGymEvent[];

    constructor(config: IInterfaceHandlerConfig) {
        this.config = config;
        this.currentlySniping = false;
    }

    public onLocationUpdate = (location: IMapLocationEvent): void => {
        if (!this.currentlySniping) {
            this.config.map.movePlayer(location);
        }
    }

    public onPokeStopList = (forts: IFortEvent[]): void => {
        if (!this.pokeStops) {
            this.pokeStops = [];
        }
        if (!this.gyms) {
            this.gyms = [];
        }
        for (let i = 0; i < forts.length; i++) {
            if (forts[i].Type === 1) {
                const pokeStop = forts[i] as IPokeStopEvent;
                pokeStop.Status = PokeStopStatus.Normal;
                if (pokeStop.CooldownCompleteTimestampMs) {
                    const currentMs = TimeUtils.getCurrentTimestampMs();
                    if (pokeStop.CooldownCompleteTimestampMs > currentMs) {
                        pokeStop.Status |= PokeStopStatus.Visited;
                    }
                }
                if (pokeStop.LureInfo !== null) {
                    pokeStop.Status |= PokeStopStatus.Lure;
                }
                this.addFortToList(pokeStop, this.pokeStops);
            } else {
                this.addFortToList(forts[i], this.gyms);
            }
        }
        this.config.map.setPokeStops(this.pokeStops);
        this.config.map.setGyms(this.gyms);
    }

    private addFortToList = (fort: IFortEvent, fortList: IFortEvent[]): void => {
        const index = _.findIndex(fortList, f => f.Id === fort.Id);
        if (index === -1) {
            fortList.push(fort);
        } else {
            fort.Name = fortList[index].Name;
            fortList[index] = fort;
        }
    }

    public onFortTarget(fortTarget: IFortTargetEvent): void {
        
    }

    public onFortUsed(fortUsed: IFortUsedEvent): void {
        const pokeStop = _.find(this.pokeStops, ps => ps.Id === fortUsed.Id);
        pokeStop.Name = fortUsed.Name;
        this.config.map.usePokeStop(fortUsed);
        this.config.notificationManager.addNotificationPokeStopUsed(fortUsed);
    }

    public onProfile(profile: IProfileEvent): void {
        
    }

    public onPokemonCapture(pokemonCapture: IPokemonCaptureEvent): void {
        if (pokemonCapture.Status == PokemonCatchStatus.Success) {
            this.config.map.onPokemonCapture(pokemonCapture);
            this.config.notificationManager.addNotificationPokemonCapture(pokemonCapture);
        }
    }

    public onEvolveCount(evolveCount: IEvolveCountEvent): void {
        
    }

    public onPokemonEvolve(pokemonEvolve: IPokemonEvolveEvent): void {
        this.config.notificationManager.addNotificationPokemonEvolved(pokemonEvolve);
    }

    public onSnipeScan(snipeScan: ISnipeScanEvent): void {
        
    }

    public onSnipeMode(snipeMode: ISnipeModeEvent): void {
        this.currentlySniping = snipeMode.Active;
    }

    public onSnipeMessage(snipeMessage: ISnipeMessageEvent): void {
        
    }

    public onUpdate(update: IUpdateEvent): void {

    }

    public onWarn(warn: IWarnEvent): void {

    }

    public onEggHatched(eggHatched: IEggHatchedEvent): void {
        this.config.notificationManager.addNotificationEggHatched(eggHatched);
    }

    public onIncubatorStatus(incubatorStatus: IIncubatorStatusEvent): void {
        this.config.notificationManager.addNotificationIncubatorStatus(incubatorStatus);
    }

    public onItemRecycle(itemRecycle: IItemRecycleEvent): void {
        this.config.notificationManager.addNotificationItemRecycle(itemRecycle);
    }

    public onPokemonTransfer(pokemonTransfer: IPokemonTransferEvent): void {
        this.config.notificationManager.addNotificationPokemonTransfer(pokemonTransfer);
    }
}