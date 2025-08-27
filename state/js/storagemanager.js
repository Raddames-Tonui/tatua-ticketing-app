function createStorage(mode = "memory") {
    let memoryStore = [];

    return {
        get: () => {
            switch (mode) {
                case "local": {
                    const raw = localStorage.getItem("tickets");
                    
                }
            }
        }
    }
}