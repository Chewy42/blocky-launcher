export namespace config {
	
	export class AccountInfo {
	    username: string;
	    displayName: string;
	    avatarUrl: string;
	    tier?: string;
	
	    static createFrom(source: any = {}) {
	        return new AccountInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.username = source["username"];
	        this.displayName = source["displayName"];
	        this.avatarUrl = source["avatarUrl"];
	        this.tier = source["tier"];
	    }
	}
	export class Accounts {
	    blockymarketplace?: AccountInfo;
	    blockynetworks?: AccountInfo;
	
	    static createFrom(source: any = {}) {
	        return new Accounts(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.blockymarketplace = this.convertValues(source["blockymarketplace"], AccountInfo);
	        this.blockynetworks = this.convertValues(source["blockynetworks"], AccountInfo);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class WindowState {
	    width: number;
	    height: number;
	    x: number;
	    y: number;
	    maximized: boolean;
	
	    static createFrom(source: any = {}) {
	        return new WindowState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.width = source["width"];
	        this.height = source["height"];
	        this.x = source["x"];
	        this.y = source["y"];
	        this.maximized = source["maximized"];
	    }
	}
	export class Settings {
	    terminalFontSize: number;
	    terminalMaxLines: number;
	    showTimestamps: boolean;
	    showLineNumbers: boolean;
	    autoScroll: boolean;
	    notifyOnCrash: boolean;
	    checkUpdates: boolean;
	    analyticsOptIn: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Settings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.terminalFontSize = source["terminalFontSize"];
	        this.terminalMaxLines = source["terminalMaxLines"];
	        this.showTimestamps = source["showTimestamps"];
	        this.showLineNumbers = source["showLineNumbers"];
	        this.autoScroll = source["autoScroll"];
	        this.notifyOnCrash = source["notifyOnCrash"];
	        this.checkUpdates = source["checkUpdates"];
	        this.analyticsOptIn = source["analyticsOptIn"];
	    }
	}
	export class Profile {
	    id: string;
	    name: string;
	    serverFolder: string;
	    serverJar: string;
	    modsFolder: string;
	    javaPath: string;
	    jvmArgs: string[];
	    programArgs: string[];
	    readySignal: string;
	
	    static createFrom(source: any = {}) {
	        return new Profile(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.serverFolder = source["serverFolder"];
	        this.serverJar = source["serverJar"];
	        this.modsFolder = source["modsFolder"];
	        this.javaPath = source["javaPath"];
	        this.jvmArgs = source["jvmArgs"];
	        this.programArgs = source["programArgs"];
	        this.readySignal = source["readySignal"];
	    }
	}
	export class AppConfig {
	    version: string;
	    activeProfile: string;
	    profiles: Profile[];
	    settings: Settings;
	    accounts: Accounts;
	    windowState: WindowState;
	    eulaAccepted: boolean;
	    eulaTimestamp?: string;
	    firstLaunch: boolean;
	    voice_guide_ready: boolean;

	    static createFrom(source: any = {}) {
	        return new AppConfig(source);
	    }

	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.version = source["version"];
	        this.activeProfile = source["activeProfile"];
	        this.profiles = this.convertValues(source["profiles"], Profile);
	        this.settings = this.convertValues(source["settings"], Settings);
	        this.accounts = this.convertValues(source["accounts"], Accounts);
	        this.windowState = this.convertValues(source["windowState"], WindowState);
	        this.eulaAccepted = source["eulaAccepted"];
	        this.eulaTimestamp = source["eulaTimestamp"];
	        this.firstLaunch = source["firstLaunch"];
	        this.voice_guide_ready = source["voice_guide_ready"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	

}

export namespace main {
	
	export class FolderValidation {
	    valid: boolean;
	    message: string;
	    detectedJar: string;
	
	    static createFrom(source: any = {}) {
	        return new FolderValidation(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.valid = source["valid"];
	        this.message = source["message"];
	        this.detectedJar = source["detectedJar"];
	    }
	}
	export class JavaInfo {
	    path: string;
	    version: string;
	    valid: boolean;
	
	    static createFrom(source: any = {}) {
	        return new JavaInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.version = source["version"];
	        this.valid = source["valid"];
	    }
	}

}

export namespace marketplace {
	
	export class OwnedPlugin {
	    id: string;
	    name: string;
	    version: string;
	    description: string;
	    thumbnailUrl: string;
	    purchasedAt: string;
	    isInstalled: boolean;
	    updateAvailable: boolean;
	    downloadUrl?: string;
	
	    static createFrom(source: any = {}) {
	        return new OwnedPlugin(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.version = source["version"];
	        this.description = source["description"];
	        this.thumbnailUrl = source["thumbnailUrl"];
	        this.purchasedAt = source["purchasedAt"];
	        this.isInstalled = source["isInstalled"];
	        this.updateAvailable = source["updateAvailable"];
	        this.downloadUrl = source["downloadUrl"];
	    }
	}

}

export namespace networks {
	
	export class ClaimedServer {
	    id: string;
	    name: string;
	    description: string;
	    createdAt: string;
	
	    static createFrom(source: any = {}) {
	        return new ClaimedServer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.createdAt = source["createdAt"];
	    }
	}

}

export namespace plugins {
	
	export class Plugin {
	    filename: string;
	    path: string;
	    name: string;
	    version: string;
	    description: string;
	    author: string;
	    enabled: boolean;
	    fileSize: number;
	    source: string;
	    sourceId: string;
	    installedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new Plugin(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.filename = source["filename"];
	        this.path = source["path"];
	        this.name = source["name"];
	        this.version = source["version"];
	        this.description = source["description"];
	        this.author = source["author"];
	        this.enabled = source["enabled"];
	        this.fileSize = source["fileSize"];
	        this.source = source["source"];
	        this.sourceId = source["sourceId"];
	        this.installedAt = source["installedAt"];
	    }
	}

}

export namespace terminal {
	
	export class Line {
	    text: string;
	    type: string;
	    timestamp: string;
	
	    static createFrom(source: any = {}) {
	        return new Line(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.text = source["text"];
	        this.type = source["type"];
	        this.timestamp = source["timestamp"];
	    }
	}

}

