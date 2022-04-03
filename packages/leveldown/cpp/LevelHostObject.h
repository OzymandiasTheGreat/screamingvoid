#ifndef LEVELHOSTOBJECT_H
#define LEVELHOSTOBJECT_H

#include <jsi/jsi.h>

namespace screamingvoid {

using namespace facebook::jsi;

class JSI_EXPORT LevelHostObject: public HostObject {
public:
    explicit LevelHostObject() {};

public:
    std::vector<PropNameID> getPropertyNames(Runtime& rt) override;
    Value get(Runtime&, const PropNameID& name) override;
};

} // namespace screamingvoid

#endif /* LEVELHOSTOBJECT_H */
