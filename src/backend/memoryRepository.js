export class MemoryRepository {
  constructor({profiles=[],sections=[],personnel=[],dfs=[],actions=[]}={}){this.profiles=profiles;this.sections=sections;this.personnel=personnel;this.dfs=dfs;this.actions=actions;this.sequences=new Map();}
  profile(userId){return this.profiles.find(x=>x.user_id===userId)} section(id){return this.sections.find(x=>x.id===id)} person(id){return this.personnel.find(x=>x.id===id)} df(id){return this.dfs.find(x=>x.id===id)}
  save(df,expected){const current=this.df(df.id);if(current&&current.version!==expected)return false;if(current)Object.assign(current,structuredClone(df));else this.dfs.push(structuredClone(df));return true}
  nextSequence(key){const n=(this.sequences.get(key)||0)+1;this.sequences.set(key,n);return n}
  audit(action){this.actions.push(structuredClone(action))}
  transaction(operation){
    const snapshot={dfs:structuredClone(this.dfs),actions:structuredClone(this.actions),sequences:new Map(this.sequences)};
    try{return operation()}catch(error){this.dfs.splice(0,this.dfs.length,...snapshot.dfs);this.actions.splice(0,this.actions.length,...snapshot.actions);this.sequences=snapshot.sequences;throw error}
  }
}
